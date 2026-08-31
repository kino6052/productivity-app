// The real implementation of TPersistence (core's persistence.ts): Firestore.
// Not unit-tested -- real network IO, same category as
// persistence-local-storage.ts.
//
// TPersistence<T>.load() is synchronous, but Firestore reads are inherently
// async. Resolved as cache-then-sync: onSnapshot keeps an in-memory cache
// up to date, and load() reads that cache synchronously. This has one
// honest, documented limitation -- on cold start, load() returns undefined
// until the first snapshot arrives (a real race, not hidden) -- rather than
// forcing an async contract onto every other TPersistence<T> caller for the
// sake of this one accident. save() writes through to Firestore and updates
// the cache immediately, so a save followed by a load in the same session
// sees its own write without waiting on the network.
//
// The whole value is stored as one JSON string field via core's
// encode/decode (json-codec.ts) rather than as native Firestore fields --
// that reuses the already-tested Date round-tripping logic and sidesteps
// reconciling our Date-tagging scheme with Firestore's own Timestamp type.
//
// Operational note: this requires Firestore security rules on the
// productivity-1be47 project that allow read/write on this document for an
// unauthenticated client (this milestone is single-user, no auth --
// docs/checklist.md). That's a Firebase Console setting, not something this
// code can configure -- until it's set, save()/clear() will reject with a
// permission-denied error.
import { getApp, getApps, initializeApp } from "firebase/app";
import { deleteDoc, doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
import type { TPersistence } from "@productivity-app/core/src/accidents/persistence/persistence";
import { decode, encode } from "@productivity-app/core/src/accidents/persistence/json-codec";
import { firebaseConfig } from "./firebase-config";

export function createFirebasePersistence<T>(collectionPath: string, docId: string): TPersistence<T> {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const ref = doc(db, collectionPath, docId);

  let cachedValue: T | undefined;

  onSnapshot(ref, (snapshot) => {
    const payload = snapshot.data()?.payload as string | undefined;
    cachedValue = payload === undefined ? undefined : decode<T>(payload);
  });

  return {
    load: () => cachedValue,
    save: (value) => {
      cachedValue = value;
      void setDoc(ref, { payload: encode(value) });
    },
    clear: () => {
      cachedValue = undefined;
      void deleteDoc(ref);
    },
  };
}
