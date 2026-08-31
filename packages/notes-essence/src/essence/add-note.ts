import type { TState } from "@productivity-app/core/src/essence/state";

export const addNote = (state: TState, itemId: string, body: string): TState => ({
  ...state,
  items: state.items.map((item) =>
    item.id === itemId ? { ...item, note: { body, parentId: item.note?.parentId } } : item,
  ),
});
