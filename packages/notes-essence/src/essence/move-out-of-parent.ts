import type { TState } from "@productivity-app/core/src/essence/state";

// Generic over S -- see core/essence/item.ts's addItem for why.
export const moveOutOfParent = <S extends TState>(state: S, itemId: string): S =>
  ({
    ...state,
    items: state.items.map((item) =>
      item.id === itemId && item.note !== undefined
        ? { ...item, note: { ...item.note, parentId: undefined } }
        : item,
    ),
  }) as S;
