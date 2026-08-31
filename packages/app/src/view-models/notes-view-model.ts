import type { TState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { addNote } from "@productivity-app/notes-essence/src/essence/add-note";
import { nestUnder } from "@productivity-app/notes-essence/src/essence/nest-under";
import { selectRootNotes } from "@productivity-app/notes-essence/src/essence/selectors";
import { selectNoteTree, type TNoteTree } from "@productivity-app/notes-essence/src/essence/select-note-tree";

// Generic over S -- see kanban-view-model.ts for why.
export type TGetState<S extends TState> = () => S;
export type TSetState<S extends TState> = (next: S) => void;

export const onAddChild = <S extends TState>(
  parentId: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  const withChild = addItem(getState(), "Untitled");
  const childId = withChild.items[withChild.items.length - 1].id;
  setState(nestUnder(withChild, childId, parentId));
};

// The one place a brand-new *root* note gets created -- onAddChildClick
// only ever nests under an existing note, so without this there'd be no
// way to create the very first note through the UI at all. Same idea as
// App.tsx's top-level "Add item" form, scoped to this view.
export const onCreateRootNote = <S extends TState>(
  title: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  const withItem = addItem(getState(), title);
  const itemId = withItem.items[withItem.items.length - 1].id;
  setState(addNote(withItem, itemId, ""));
};

export type TNoteViewModel = {
  id: string;
  title: string;
  onAddChildClick: () => void;
  children: TNoteViewModel[];
};

export type TNotesViewModel = {
  roots: TNoteViewModel[];
  onCreateRootNote: (title: string) => void;
};

const compileNoteViewModel = <S extends TState>(
  tree: TNoteTree,
  getState: TGetState<S>,
  setState: TSetState<S>,
): TNoteViewModel => ({
  id: tree.item.id,
  title: tree.item.title,
  onAddChildClick: () => onAddChild(tree.item.id, getState, setState),
  children: tree.children.map((child) => compileNoteViewModel(child, getState, setState)),
});

export const compileNotesViewModel = <S extends TState>(
  state: S,
  getState: TGetState<S>,
  setState: TSetState<S>,
): TNotesViewModel => ({
  roots: selectRootNotes(state).map((root) =>
    compileNoteViewModel(selectNoteTree(state, root.id)!, getState, setState),
  ),
  onCreateRootNote: (title) => onCreateRootNote(title, getState, setState),
});
