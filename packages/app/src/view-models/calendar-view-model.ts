import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { unscheduleItem } from "@productivity-app/calendar-essence/src/essence/unschedule-item";
import { selectItemsOnDay } from "@productivity-app/calendar-essence/src/essence/selectors";

export type TGetState = () => TState;
export type TSetState = (next: TState) => void;

export const onScheduleItem = (
  itemId: string,
  day: Date,
  getState: TGetState,
  setState: TSetState,
): void => {
  setState(scheduleItem(getState(), itemId, day, day));
};

export const onUnscheduleItem = (itemId: string, getState: TGetState, setState: TSetState): void => {
  setState(unscheduleItem(getState(), itemId));
};

export type TCalendarItemViewModel = {
  id: string;
  title: string;
  // Presence, not a flag -- exactly one of these two is ever defined,
  // same rule as pomodoro-view-model.ts's session actions.
  onScheduleClick: (() => void) | undefined;
  onUnscheduleClick: (() => void) | undefined;
};

export type TCalendarViewModel = {
  dayLabel: string;
  scheduledToday: TCalendarItemViewModel[];
  unscheduled: TCalendarItemViewModel[];
};

export const compileCalendarViewModel = (
  state: TState,
  day: Date,
  getState: TGetState,
  setState: TSetState,
): TCalendarViewModel => {
  const compileScheduled = (item: TItem): TCalendarItemViewModel => ({
    id: item.id,
    title: item.title,
    onScheduleClick: undefined,
    onUnscheduleClick: () => onUnscheduleItem(item.id, getState, setState),
  });

  const compileUnscheduled = (item: TItem): TCalendarItemViewModel => ({
    id: item.id,
    title: item.title,
    onScheduleClick: () => onScheduleItem(item.id, day, getState, setState),
    onUnscheduleClick: undefined,
  });

  return {
    dayLabel: day.toISOString().slice(0, 10),
    scheduledToday: selectItemsOnDay(state, day).map(compileScheduled),
    unscheduled: state.items.filter((item) => item.calendar === undefined).map(compileUnscheduled),
  };
};
