import type { TState } from "@productivity-app/core/src/essence/state";
import { selectRootNotes } from "@productivity-app/notes-essence/src/essence/selectors";
import { selectNoteTree, type TNoteTree } from "@productivity-app/notes-essence/src/essence/select-note-tree";

const renderTree = (tree: TNoteTree): string =>
  `<li data-item-id="${tree.item.id}">
    ${tree.item.title}
    <button data-action="add-child" data-parent-id="${tree.item.id}">Add child</button>
    <ul>${tree.children.map(renderTree).join("")}</ul>
  </li>`;

export const renderNotes = (state: TState): string =>
  `<ul>${selectRootNotes(state)
    .map((root) => renderTree(selectNoteTree(state, root.id)!))
    .join("")}</ul>`;
