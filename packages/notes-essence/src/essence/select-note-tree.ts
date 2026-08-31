import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { selectChildren } from "./selectors";

export type TNoteTree = {
  item: TItem;
  children: TNoteTree[];
};

export const selectNoteTree = (state: TState, rootId: string): TNoteTree | undefined => {
  const item = state.items.find((candidate) => candidate.id === rootId);
  if (item === undefined) {
    return undefined;
  }

  return {
    item,
    children: selectChildren(state, rootId).map(
      (child) => selectNoteTree(state, child.id) as TNoteTree,
    ),
  };
};
