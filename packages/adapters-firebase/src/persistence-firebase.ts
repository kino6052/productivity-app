// The real implementation of TPersistence (core's persistence.ts): Firestore.
// Not unit-tested -- real network IO, same category as
// persistence-local-storage.ts.
//
// TPersistence<T>.load() is synchronous, but Firestore reads are inherently
// async. Resolved as cache-then-sync: onSnapshot keeps an in-memory cache
// up to date, and load() reads that cache synchronously. save() writes
// through to Firestore and updates the cache immediately, so a save
// followed by a load in the same session sees its own write without
// waiting on the network.
//
// load() alone still can't see a value that arrives *after* a caller has
// already read it once (a cold-start race: nothing calls load() again on
// its own when the first real snapshot lands). This adapter's extra
// subscribe() closes that gap for callers that want it -- it fires with
// every value onSnapshot produces, including the first one, so a
// composition root can seed its state from load() and then update it
// again once the real value arrives, instead of quietly showing stale
// initial state forever. TPersistence<T>'s own generic callers are
// unaffected: subscribe is additive, not part of that contract.
//
// The whole value is stored as one JSON string field via core's
// encode/decode (json-codec.ts) rather than as native Firestore fields --
// that reuses the already-tested Date round-tripping logic and sidesteps
// reconciling our Date-tagging scheme with Firestore's own Timestamp type.
//
// Auth: this milestone has no user-facing sign-in (docs/checklist.md) --
// anonymous auth here exists purely to satisfy Firestore's security rules
// (`allow read, write: if request.auth != null`), not to identify anyone.
// No UI ever surfaces a signed-in state; it's an implementation detail of
// this one accident. Firestore access is gated on it: onSnapshot doesn't
// attach until sign-in resolves (an unauthenticated attempt would just
// fail with permission-denied and never reattach on its own once auth
// arrives), and save() queues at most the latest pending value (only the
// newest state matters for a single-document store) if a write is
// attempted before that -- otherwise that write would fail outright and
// never retry, since a rejected setDoc call doesn't reattempt itself the
// way a live onSnapshot listener does.
//
// Writes go through createWriteQueue (real bug, found via user report:
// "race conditions when starting/stopping/moving done and back") --
// view-model actions are synchronous and never await save(), so two
// state-changing clicks fired close together (e.g. Start immediately
// followed by Mark done) would otherwise start two independent setDoc
// calls with no ordering guarantee between them; whichever happened to
// reach Firestore's server *last* would win, not necessarily the one
// that was logically the more recent action -- silently reverting newer
// state to something stale. The queue guarantees at most one write in
// flight and coalesces to the latest value, so this can't happen.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { deleteDoc, doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import type { TPersistence } from "@productivity-app/core/src/accidents/persistence/persistence";
import { decode, encode } from "@productivity-app/core/src/accidents/persistence/json-codec";
import { createWriteQueue } from "@productivity-app/core/src/accidents/write-queue/write-queue";
import { firebaseConfig } from "./firebase-config";

export type TFirebasePersistence<T> = TPersistence<T> & {
  // Fires with the current value every time onSnapshot produces one,
  // including the first -- see the file header for why this exists.
  subscribe: (listener: (value: T | undefined) => void) => () => void;
};

export function createFirebasePersistence<T>(collectionPath: string, docId: string): TFirebasePersistence<T> {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const ref = doc(db, collectionPath, docId);

  let cachedValue: T | undefined;
  let isAuthed = false;
  let pendingWrite: { value: T } | undefined;
  const listeners = new Set<(value: T | undefined) => void>();

  const writeQueue = createWriteQueue<T>(
    (value) => setDoc(ref, { payload: encode(value) }),
    (error: unknown) => {
      console.error(`[persistence-firebase] write to ${collectionPath}/${docId} failed:`, error);
    },
  );
  const writeThrough = (value: T) => writeQueue.enqueue(value);

  onAuthStateChanged(auth, (user) => {
    if (user === null) return;
    isAuthed = true;

    onSnapshot(
      ref,
      (snapshot) => {
        const payload = snapshot.data()?.payload as string | undefined;
        cachedValue = payload === undefined ? undefined : decode<T>(payload);
        for (const listener of listeners) {
          listener(cachedValue);
        }
      },
      // Previously missing entirely -- a denied read failed completely
      // silently (no console output, nothing reaching the composition
      // root), indistinguishable from "no document yet" or "still loading".
      // Logged, not swallowed.
      (error) => {
        console.error(`[persistence-firebase] read of ${collectionPath}/${docId} failed:`, error);
      },
    );

    if (pendingWrite !== undefined) {
      const { value } = pendingWrite;
      pendingWrite = undefined;
      writeThrough(value);
    }
  });

  signInAnonymously(auth).catch((error: unknown) => {
    console.error(`[persistence-firebase] anonymous sign-in failed:`, error);
  });

  return {
    load: () => cachedValue,
    save: (value) => {
      cachedValue = value;
      if (isAuthed) {
        writeThrough(value);
      } else {
        pendingWrite = { value };
      }
    },
    clear: () => {
      cachedValue = undefined;
      pendingWrite = undefined;
      if (isAuthed) {
        deleteDoc(ref).catch((error: unknown) => {
          console.error(`[persistence-firebase] delete of ${collectionPath}/${docId} failed:`, error);
        });
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
