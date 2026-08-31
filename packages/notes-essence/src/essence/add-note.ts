import type { TState } from "@productivity-app/core/src/essence/state";

// Generic over S -- see core/essence/item.ts's addItem for why.
export const addNote = <S extends TState>(state: S, itemId: string, body: string): S =>
  ({
    ...state,
    items: state.items.map((item) =>
      item.id === itemId ? { ...item, note: { body, parentId: item.note?.parentId } } : item,
    ),
  }) as S;
