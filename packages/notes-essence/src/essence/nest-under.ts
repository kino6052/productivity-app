import type { TState } from "@productivity-app/core/src/essence/state";

// Is `candidateId` itself, or an ancestor reached by walking up `fromId`'s
// parent chain? Checking this from the *new* parent's side catches both a
// direct self-nest (candidateId === fromId, matched on the first step) and
// a longer cycle in one pass.
const isSelfOrAncestor = (state: TState, candidateId: string, fromId: string): boolean => {
  let currentId: string | undefined = fromId;
  while (currentId !== undefined) {
    if (currentId === candidateId) {
      return true;
    }
    currentId = state.items.find((item) => item.id === currentId)?.note?.parentId;
  }
  return false;
};

export const nestUnder = (state: TState, itemId: string, parentId: string): TState => {
  if (isSelfOrAncestor(state, itemId, parentId)) {
    return state;
  }

  return {
    ...state,
    items: state.items.map((item) =>
      item.id === itemId ? { ...item, note: { body: item.note?.body ?? "", parentId } } : item,
    ),
  };
};
