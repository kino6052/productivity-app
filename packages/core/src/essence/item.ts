import type { TState } from "./state";

// Generic over S rather than fixed to TState, so a composed state like
// pomodoro-essence's TPomodoroState (TState & {activeSession}) flows
// through unchanged -- the extra field survives the object spread at
// runtime regardless, this just lets the type system track it too,
// instead of every caller needing a manual {...state, ...addItem(...)}
// merge to reconstitute the wrapper type.
export const addItem = <S extends TState>(state: S, title: string): S =>
  ({
    ...state,
    items: [
      ...state.items,
      { id: crypto.randomUUID(), title, createdAt: new Date() },
    ],
  }) as S;
