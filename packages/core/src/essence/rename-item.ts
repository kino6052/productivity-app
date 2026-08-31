import type { TState } from "./state";

// Generic over S -- see addItem.ts for why.
export const renameItem = <S extends TState>(state: S, id: string, title: string): S =>
  ({
    ...state,
    items: state.items.map((item) => (item.id === id ? { ...item, title } : item)),
  }) as S;
