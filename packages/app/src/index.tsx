// THE REAL COMPOSITION ROOT -- same shape as index.essential-dependencies.tsx,
// wired to real browser IO: createLocalStoragePersistence instead of
// createMemoryPersistence, so state survives a page reload. Not
// unit-tested -- real Solid signals + a real browser global.
import { createSignal } from "solid-js";
import { createLocalStoragePersistence } from "@productivity-app/core/src/accidents/persistence/persistence-local-storage";
import {
  createInitialPomodoroState,
  type TPomodoroState,
} from "@productivity-app/pomodoro-essence/src/essence/state";
import { App } from "./accidents/view/solid/App";

const PERSISTENCE_KEY = "productivity-app-state";

export function createRealApp() {
  const persistence = createLocalStoragePersistence<TPomodoroState>(PERSISTENCE_KEY);
  const [state, setState] = createSignal<TPomodoroState>(persistence.load() ?? createInitialPomodoroState());

  const setStateAndPersist = (next: TPomodoroState) => {
    persistence.save(next);
    setState(next);
  };

  return () => <App state={state} setState={setStateAndPersist} today={new Date()} />;
}
