import type { TState } from "./state";

export const renameItem = (state: TState, id: string, title: string): TState => ({
  ...state,
  items: state.items.map((item) => (item.id === id ? { ...item, title } : item)),
});
