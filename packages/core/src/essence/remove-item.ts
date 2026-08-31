import type { TState } from "./state";

export const removeItem = (state: TState, id: string): TState => ({
  ...state,
  items: state.items.filter((item) => item.id !== id),
});
