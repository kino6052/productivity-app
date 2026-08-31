import type { TItem, TState } from "@productivity-app/core/src/essence/state";

const isSameUtcDay = (a: Date, b: Date): boolean => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

export const selectItemsOnDay = (state: TState, day: Date): TItem[] =>
  state.items.filter((item) => item.calendar !== undefined && isSameUtcDay(item.calendar.start, day));
