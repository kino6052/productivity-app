// Not "store" -- same naming rule as everywhere else (docs/conventions.md).
// What this holds is a value and a way to be told when it changes. Generic
// over T so this file doesn't need to know anything about TState/TItem --
// same ISP discipline as TPersistence<T>.
export type TStateManagement<T> = {
  getState: () => T;
  setState: (next: T) => void;
  subscribe: (listener: (state: T) => void) => () => void;
};

// The simplest implementation: a plain closure and a Set of listeners, no
// library underneath it. Ported from conduit's state-management.ts.
// conduit also keeps a createRxState (RxJS BehaviorSubject) alongside this
// one for its real app -- deferred here until Part 7 picks a UI stack that
// actually needs it (docs/checklist.md).
export function createMemoryState<T>(initial: T): TStateManagement<T> {
  let state = initial;
  const listeners = new Set<(state: T) => void>();

  return {
    getState: () => state,
    setState: (next) => {
      state = next;
      for (const listener of listeners) listener(state);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
