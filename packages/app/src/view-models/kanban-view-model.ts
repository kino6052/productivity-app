import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { selectItemsByColumn } from "@productivity-app/kanban-essence/src/essence/selectors";

// Fixed, same as accidents/view/essence/kanban.ts -- kanban-essence itself
// is column-agnostic, this is just this view's illustrative set.
const COLUMNS = ["todo", "doing", "done"];

export type TGetState = () => TState;
export type TSetState = (next: TState) => void;

export const onMoveItem = (
  itemId: string,
  column: string,
  getState: TGetState,
  setState: TSetState,
): void => {
  setState(moveItem(getState(), itemId, column));
};

export type TMoveButtonViewModel = {
  columnLabel: string;
  onClick: () => void;
};

export type TKanbanCardViewModel = {
  id: string;
  title: string;
  moveButtons: TMoveButtonViewModel[];
};

export type TKanbanColumnViewModel = {
  name: string;
  cards: TKanbanCardViewModel[];
};

export type TKanbanViewModel = {
  inbox: TKanbanCardViewModel[];
  columns: TKanbanColumnViewModel[];
};

const compileCardViewModel = (item: TItem, getState: TGetState, setState: TSetState): TKanbanCardViewModel => ({
  id: item.id,
  title: item.title,
  moveButtons: COLUMNS.filter((column) => item.kanban?.column !== column).map((column) => ({
    columnLabel: column,
    onClick: () => onMoveItem(item.id, column, getState, setState),
  })),
});

export const compileKanbanViewModel = (
  state: TState,
  getState: TGetState,
  setState: TSetState,
): TKanbanViewModel => ({
  inbox: state.items
    .filter((item) => item.kanban === undefined)
    .map((item) => compileCardViewModel(item, getState, setState)),
  columns: COLUMNS.map((column) => ({
    name: column,
    cards: selectItemsByColumn(state, column).map((item) => compileCardViewModel(item, getState, setState)),
  })),
});
