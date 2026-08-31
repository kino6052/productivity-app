import type { TItem, TState } from "./state";

export const selectAllItems = (state: TState): TItem[] => state.items;

export const selectItem = (state: TState, id: string): TItem | undefined =>
  state.items.find((item) => item.id === id);
