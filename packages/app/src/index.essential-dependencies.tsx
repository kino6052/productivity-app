// THE ESSENTIAL-DEPENDENCIES COMPOSITION ROOT -- a sibling to src/index.tsx
// (the real app), same reasoning as conduit's own file of this name: proves
// every dependency App needs is injectable, wired to the simplest
// implementation with nothing behind it but a plain closure --
// createMemoryPersistence instead of createLocalStoragePersistence. Not
// unit-tested (constructs real Solid signals); the essence/view-model logic
// it wires together is already covered by their own tests.
import { createSignal } from "solid-js";
import { createMemoryPersistence } from "@productivity-app/core/src/accidents/persistence/persistence";
import {
  createInitialPomodoroState,
  type TPomodoroState,
} from "@productivity-app/pomodoro-essence/src/essence/state";
import { App } from "./accidents/view/solid/App";

export function createEssentialDependenciesApp() {
  const persistence = createMemoryPersistence<TPomodoroState>();
  const [state, setState] = createSignal<TPomodoroState>(persistence.load() ?? createInitialPomodoroState());

  const setStateAndPersist = (next: TPomodoroState) => {
    persistence.save(next);
    setState(next);
  };

  return () => <App state={state} setState={setStateAndPersist} today={new Date()} />;
}
