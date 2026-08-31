import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { selectItemsByColumn } from "@productivity-app/kanban-essence/src/essence/selectors";

// Fixed for the grounding tool -- kanban-essence itself doesn't hardcode
// column names (moveItem/selectColumns are column-agnostic), this is just
// this view's own illustrative set. A real UI could let columns be
// user-defined; not needed to prove the essence out.
const COLUMNS = ["todo", "doing", "done"];

const renderMoveButtons = (item: TItem): string =>
  COLUMNS.filter((column) => item.kanban?.column !== column)
    .map(
      (column) =>
        `<button data-action="move-item" data-item-id="${item.id}" data-column="${column}">Move to ${column}</button>`,
    )
    .join("");

const renderCard = (item: TItem): string =>
  `<li data-item-id="${item.id}">${item.title} ${renderMoveButtons(item)}</li>`;

const renderColumn = (state: TState, column: string): string =>
  `<section data-column-name="${column}"><h3>${column}</h3><ul>${selectItemsByColumn(state, column)
    .map(renderCard)
    .join("")}</ul></section>`;

const selectUnassignedItems = (state: TState): TItem[] =>
  state.items.filter((item) => item.kanban === undefined);

export const renderKanban = (state: TState): string =>
  `<section data-column-name="inbox"><h3>Inbox</h3><ul>${selectUnassignedItems(state)
    .map(renderCard)
    .join("")}</ul></section>${COLUMNS.map((column) => renderColumn(state, column)).join("")}`;
