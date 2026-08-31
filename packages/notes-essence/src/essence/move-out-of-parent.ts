import type { TState } from "@productivity-app/core/src/essence/state";

export const moveOutOfParent = (state: TState, itemId: string): TState => ({
  ...state,
  items: state.items.map((item) =>
    item.id === itemId && item.note !== undefined
      ? { ...item, note: { ...item.note, parentId: undefined } }
      : item,
  ),
});
