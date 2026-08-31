import type { TItem, TState } from "@productivity-app/core/src/essence/state";

export const selectChildren = (state: TState, parentId: string): TItem[] =>
  state.items.filter((item) => item.note?.parentId === parentId);

export const selectRootNotes = (state: TState): TItem[] =>
  state.items.filter((item) => item.note !== undefined && item.note.parentId === undefined);
