import type { TState } from "@productivity-app/core/src/essence/state";

export const scheduleItem = (state: TState, itemId: string, start: Date, end: Date): TState => ({
  ...state,
  items: state.items.map((item) => (item.id === itemId ? { ...item, calendar: { start, end } } : item)),
});
