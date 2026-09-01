// THE REAL COMPOSITION ROOT -- same shape as index.essential-dependencies.tsx,
// wired to real Firestore persistence via the Firebase client SDK (no
// backend server -- the client talks directly to Google's managed
// Firestore, docs/checklist.md Part 9). Not unit-tested -- real Solid
// signals + real network IO.
import { createSignal, onCleanup } from "solid-js";
import { createFirebasePersistence } from "@productivity-app/adapters-firebase/src/persistence-firebase";
import {
  createInitialPomodoroState,
  type TPomodoroState,
} from "@productivity-app/pomodoro-essence/src/essence/state";
import { App } from "./accidents/view/solid/App";

// Single-user, no auth (this milestone's scope) -- one fixed document
// for the whole app's state.
const COLLECTION_PATH = "productivity-app";
const DOC_ID = "state";

export function createRealApp() {
  const persistence = createFirebasePersistence<TPomodoroState>(COLLECTION_PATH, DOC_ID);
  const [state, setState] = createSignal<TPomodoroState>(persistence.load() ?? createInitialPomodoroState());
  // Firestore-backed persistence has a real, visible warm-up now
  // (anonymous sign-in, then the first snapshot) -- without this, the
  // app would flash an empty "New project" screen during that window,
  // indistinguishable from "you genuinely have no projects yet".
  const [isLoading, setIsLoading] = createSignal(true);

  // Resolves persistence-firebase.ts's documented cold-start race: load()
  // above is almost always undefined on first render, since Firestore's
  // onSnapshot hasn't fired yet at that point. subscribe() catches that
  // first real snapshot -- and any later one, e.g. a value written from
  // another tab -- and updates state to match, instead of silently
  // showing empty/stale state forever. The same first call is also what
  // resolves isLoading.
  const unsubscribe = persistence.subscribe((value) => {
    setState(value ?? createInitialPomodoroState());
    setIsLoading(false);
  });

  const setStateAndPersist = (next: TPomodoroState) => {
    persistence.save(next);
    setState(next);
  };

  return function RealApp() {
    onCleanup(unsubscribe);
    return <App state={state} setState={setStateAndPersist} today={new Date()} isLoading={isLoading} />;
  };
}
