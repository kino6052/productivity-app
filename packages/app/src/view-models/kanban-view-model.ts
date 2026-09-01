import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { renameItem } from "@productivity-app/core/src/essence/rename-item";
import { removeItem } from "@productivity-app/core/src/essence/remove-item";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { selectItemsByColumn } from "@productivity-app/kanban-essence/src/essence/selectors";
import { clearOrphanedPomodoroSession } from "./clear-orphaned-pomodoro-session";

// Fixed, same as accidents/view/essence/kanban.ts -- kanban-essence itself
// is column-agnostic, this is just this view's illustrative set.
const COLUMNS = ["todo", "doing", "done"];

// Generic over S -- so this compiles against a composed state like
// pomodoro-essence's TPomodoroState too, sharing the same getState/setState
// pair the composition root's other three view-models use (same reasoning
// as the essence layer's own <S extends TState> fix; see core/item.ts).
export type TGetState<S extends TState> = () => S;
export type TSetState<S extends TState> = (next: S) => void;

// Real bug, found live: moving an item straight to "done" from here (this
// view's own "Move to done" button -- independent of Pomodoro's Mark
// done, or a work phase finishing naturally) left activeSession pointing
// at it if that item's session was running. The item still exists, just
// done, so startSession's own orphan self-heal doesn't catch it -- every
// future Start silently stopped working. "Done" is the actual trigger,
// not which button was clicked to get there, so this reuses the same
// clearOrphanedPomodoroSession every other "an item became ineligible
// for an active session" path already goes through.
export const onMoveItem = <S extends TState>(
  itemId: string,
  column: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  const next = moveItem(getState(), itemId, column);
  setState(column === "done" ? clearOrphanedPomodoroSession(next, itemId) : next);
};

export const onRenameItem = <S extends TState>(
  itemId: string,
  title: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(renameItem(getState(), itemId, title));
};

// Deleting an item currently running a pomodoro session would otherwise
// orphan that session forever (see clear-orphaned-pomodoro-session.ts) --
// this view can delete any item too (Part 11's context menu), not just
// Pomodoro's own view.
export const onDeleteItem = <S extends TState>(
  itemId: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(clearOrphanedPomodoroSession(removeItem(getState(), itemId), itemId));
};

export type TMoveButtonViewModel = {
  columnLabel: string;
  onClick: () => void;
};

export type TKanbanCardViewModel = {
  id: string;
  title: string;
  moveButtons: TMoveButtonViewModel[];
  onRenameClick: (title: string) => void;
  onDeleteClick: () => void;
};

export type TKanbanColumnViewModel = {
  name: string;
  cards: TKanbanCardViewModel[];
};

export type TKanbanViewModel = {
  inbox: TKanbanCardViewModel[];
  columns: TKanbanColumnViewModel[];
};

const compileCardViewModel = <S extends TState>(
  item: TItem,
  getState: TGetState<S>,
  setState: TSetState<S>,
): TKanbanCardViewModel => ({
  id: item.id,
  title: item.title,
  moveButtons: COLUMNS.filter((column) => item.kanban?.column !== column).map((column) => ({
    columnLabel: column,
    onClick: () => onMoveItem(item.id, column, getState, setState),
  })),
  onRenameClick: (title) => onRenameItem(item.id, title, getState, setState),
  onDeleteClick: () => onDeleteItem(item.id, getState, setState),
});

export const compileKanbanViewModel = <S extends TState>(
  state: S,
  getState: TGetState<S>,
  setState: TSetState<S>,
): TKanbanViewModel => ({
  inbox: state.items
    .filter((item) => item.kanban === undefined)
    .map((item) => compileCardViewModel(item, getState, setState)),
  columns: COLUMNS.map((column) => ({
    name: column,
    cards: selectItemsByColumn(state, column).map((item) => compileCardViewModel(item, getState, setState)),
  })),
});
