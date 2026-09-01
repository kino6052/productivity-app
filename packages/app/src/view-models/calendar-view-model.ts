import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { renameItem } from "@productivity-app/core/src/essence/rename-item";
import { removeItem } from "@productivity-app/core/src/essence/remove-item";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { unscheduleItem } from "@productivity-app/calendar-essence/src/essence/unschedule-item";
import { selectItemsOnDay } from "@productivity-app/calendar-essence/src/essence/selectors";

// Generic over S -- see kanban-view-model.ts for why.
export type TGetState<S extends TState> = () => S;
export type TSetState<S extends TState> = (next: S) => void;

export const onScheduleItem = <S extends TState>(
  itemId: string,
  day: Date,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(scheduleItem(getState(), itemId, day, day));
};

export const onUnscheduleItem = <S extends TState>(
  itemId: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(unscheduleItem(getState(), itemId));
};

export const onRenameItem = <S extends TState>(
  itemId: string,
  title: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(renameItem(getState(), itemId, title));
};

export const onDeleteItem = <S extends TState>(
  itemId: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(removeItem(getState(), itemId));
};

export type TCalendarItemViewModel = {
  id: string;
  title: string;
  // Presence, not a flag -- exactly one of these two is ever defined,
  // same rule as pomodoro-view-model.ts's session actions.
  onScheduleClick: (() => void) | undefined;
  onUnscheduleClick: (() => void) | undefined;
  onRenameClick: (title: string) => void;
  onDeleteClick: () => void;
};

export type TCalendarViewModel = {
  dayLabel: string;
  scheduledToday: TCalendarItemViewModel[];
  unscheduled: TCalendarItemViewModel[];
};

export const compileCalendarViewModel = <S extends TState>(
  state: S,
  day: Date,
  getState: TGetState<S>,
  setState: TSetState<S>,
): TCalendarViewModel => {
  const compileScheduled = (item: TItem): TCalendarItemViewModel => ({
    id: item.id,
    title: item.title,
    onScheduleClick: undefined,
    onUnscheduleClick: () => onUnscheduleItem(item.id, getState, setState),
    onRenameClick: (title) => onRenameItem(item.id, title, getState, setState),
    onDeleteClick: () => onDeleteItem(item.id, getState, setState),
  });

  const compileUnscheduled = (item: TItem): TCalendarItemViewModel => ({
    id: item.id,
    title: item.title,
    onScheduleClick: () => onScheduleItem(item.id, day, getState, setState),
    onUnscheduleClick: undefined,
    onRenameClick: (title) => onRenameItem(item.id, title, getState, setState),
    onDeleteClick: () => onDeleteItem(item.id, getState, setState),
  });

  return {
    dayLabel: day.toISOString().slice(0, 10),
    scheduledToday: selectItemsOnDay(state, day).map(compileScheduled),
    unscheduled: state.items.filter((item) => item.calendar === undefined).map(compileUnscheduled),
  };
};
