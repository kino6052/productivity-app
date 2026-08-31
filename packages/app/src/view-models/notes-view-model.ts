import type { TState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { nestUnder } from "@productivity-app/notes-essence/src/essence/nest-under";
import { selectRootNotes } from "@productivity-app/notes-essence/src/essence/selectors";
import { selectNoteTree, type TNoteTree } from "@productivity-app/notes-essence/src/essence/select-note-tree";

export type TGetState = () => TState;
export type TSetState = (next: TState) => void;

export const onAddChild = (parentId: string, getState: TGetState, setState: TSetState): void => {
  const withChild = addItem(getState(), "Untitled");
  const childId = withChild.items[withChild.items.length - 1].id;
  setState(nestUnder(withChild, childId, parentId));
};

export type TNoteViewModel = {
  id: string;
  title: string;
  onAddChildClick: () => void;
  children: TNoteViewModel[];
};

export type TNotesViewModel = {
  roots: TNoteViewModel[];
};

const compileNoteViewModel = (
  tree: TNoteTree,
  getState: TGetState,
  setState: TSetState,
): TNoteViewModel => ({
  id: tree.item.id,
  title: tree.item.title,
  onAddChildClick: () => onAddChild(tree.item.id, getState, setState),
  children: tree.children.map((child) => compileNoteViewModel(child, getState, setState)),
});

export const compileNotesViewModel = (
  state: TState,
  getState: TGetState,
  setState: TSetState,
): TNotesViewModel => ({
  roots: selectRootNotes(state).map((root) =>
    compileNoteViewModel(selectNoteTree(state, root.id)!, getState, setState),
  ),
});
