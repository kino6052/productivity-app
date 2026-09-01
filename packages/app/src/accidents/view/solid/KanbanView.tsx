import { For } from "solid-js";
import type { TKanbanCardViewModel, TKanbanViewModel } from "../../../view-models/kanban-view-model";
import { createRenameDeleteActions, useContextMenuTrigger } from "./ContextMenu";

function Card(props: { card: TKanbanCardViewModel }) {
  const menuTrigger = useContextMenuTrigger(() =>
    createRenameDeleteActions(props.card.title, props.card.onRenameClick, props.card.onDeleteClick),
  );

  return (
    <li class="kanban-card" {...menuTrigger}>
      <span class="kanban-card__title">{props.card.title}</span>
      <div class="kanban-card__moves">
        <For each={props.card.moveButtons}>
          {(button) => <button onClick={button.onClick}>Move to {button.columnLabel}</button>}
        </For>
      </div>
    </li>
  );
}

export function KanbanView(props: { vm: TKanbanViewModel }) {
  return (
    <div class="kanban-board">
      <div class="kanban-column">
        <h3>Inbox</h3>
        <ul class="item-list">
          <For each={props.vm.inbox}>{(card) => <Card card={card} />}</For>
        </ul>
      </div>
      <For each={props.vm.columns}>
        {(column) => (
          <div class="kanban-column">
            <h3>{column.name}</h3>
            <ul class="item-list">
              <For each={column.cards}>{(card) => <Card card={card} />}</For>
            </ul>
          </div>
        )}
      </For>
    </div>
  );
}
