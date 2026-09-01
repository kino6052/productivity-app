import { For } from "solid-js";
import type { TNoteViewModel, TNotesViewModel } from "../../../view-models/notes-view-model";
import { createRenameDeleteActions, useContextMenuTrigger } from "./ContextMenu";

function Note(props: { note: TNoteViewModel }) {
  const menuTrigger = useContextMenuTrigger(() =>
    createRenameDeleteActions(props.note.title, props.note.onRenameClick, props.note.onDeleteClick),
  );

  return (
    <li class="note-node">
      <div class="note-node__row" {...menuTrigger}>
        <span class="note-node__title">{props.note.title}</span>
        <button onClick={props.note.onAddChildClick}>Add child</button>
      </div>
      <ul class="notes-tree">
        <For each={props.note.children}>{(child) => <Note note={child} />}</For>
      </ul>
    </li>
  );
}

export function NotesView(props: { vm: TNotesViewModel }) {
  let titleInput: HTMLInputElement | undefined;

  const onCreateRootNote = (event: SubmitEvent) => {
    event.preventDefault();
    const title = titleInput?.value.trim();
    if (!title) return;
    props.vm.onCreateRootNote(title);
    if (titleInput) titleInput.value = "";
  };

  return (
    <div>
      <form class="add-item-form" onSubmit={onCreateRootNote}>
        <input ref={titleInput} placeholder="New notebook title" />
        <button type="submit">New notebook</button>
      </form>
      <ul class="notes-tree">
        <For each={props.vm.roots}>{(root) => <Note note={root} />}</For>
      </ul>
    </div>
  );
}
