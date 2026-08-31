import type { TState } from "./state";

export const addItem = (state: TState, title: string): TState => ({
  ...state,
  items: [
    ...state.items,
    { id: crypto.randomUUID(), title, createdAt: new Date() },
  ],
});
