import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { renameItem } from "@productivity-app/core/src/essence/rename-item";
import { removeItem } from "@productivity-app/core/src/essence/remove-item";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { unscheduleItem } from "@productivity-app/calendar-essence/src/essence/unschedule-item";
import { selectItemsOnDay } from "@productivity-app/calendar-essence/src/essence/selectors";
import { selectDateRange, selectDayRange } from "@productivity-app/calendar-essence/src/essence/date-range";
import type { TCalendarViewMode, TDateRange } from "@productivity-app/calendar-essence/src/essence/date-range";
import { clearOrphanedPomodoroSession } from "./clear-orphaned-pomodoro-session";

// Re-exported so consumers (the Solid view, tests) only need to import
// from this one module for the calendar's whole surface.
export type { TCalendarViewMode };

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

export type TCalendarDayViewModel = {
  dayLabel: string;
  items: TCalendarItemViewModel[];
};

export type TCalendarViewModel = {
  mode: TCalendarViewMode;
  // "2026-09-03" for day mode, "2026-08-31 – 2026-09-06" for week,
  // "2026-09" for month -- a plain label, not a Date; the view owns any
  // further formatting/localization.
  rangeLabel: string;
  // One entry per day in the current mode's range (always 1 in day mode,
  // 7 in week mode, however many days the month has in month mode) --
  // one shape regardless of mode, rather than a different field per mode.
  days: TCalendarDayViewModel[];
  unscheduled: TCalendarItemViewModel[];
};

const formatRangeLabel = (range: TDateRange, mode: TCalendarViewMode): string => {
  const startLabel = range.start.toISOString().slice(0, 10);
  if (mode === "day") return startLabel;
  if (mode === "month") return startLabel.slice(0, 7);
  return `${startLabel} – ${range.end.toISOString().slice(0, 10)}`;
};

export const compileCalendarViewModel = <S extends TState>(
  state: S,
  referenceDay: Date,
  mode: TCalendarViewMode,
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

  // "Schedule" always targets the reference day itself (the day the user
  // is actually focused on), not the first day of a week/month range --
  // an unscheduled item has no day of its own yet, so this is a single
  // flat action rather than one per visible day.
  const scheduleTarget = selectDayRange(referenceDay).start;
  const compileUnscheduled = (item: TItem): TCalendarItemViewModel => ({
    id: item.id,
    title: item.title,
    onScheduleClick: () => onScheduleItem(item.id, scheduleTarget, getState, setState),
    onUnscheduleClick: undefined,
    onRenameClick: (title) => onRenameItem(item.id, title, getState, setState),
    onDeleteClick: () => onDeleteItem(item.id, getState, setState),
  });

  const range = selectDateRange(referenceDay, mode);

  return {
    mode,
    rangeLabel: formatRangeLabel(range, mode),
    days: range.days.map((day) => ({
      dayLabel: day.toISOString().slice(0, 10),
      items: selectItemsOnDay(state, day).map(compileScheduled),
    })),
    unscheduled: state.items.filter((item) => item.calendar === undefined).map(compileUnscheduled),
  };
};
