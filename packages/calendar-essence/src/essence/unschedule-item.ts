import type { TItem, TState } from "@productivity-app/core/src/essence/state";

const withoutCalendar = (item: TItem): TItem => {
  const { calendar, ...rest } = item;
  return rest;
};

export const unscheduleItem = (state: TState, itemId: string): TState => ({
  ...state,
  items: state.items.map((item) => (item.id === itemId ? withoutCalendar(item) : item)),
});
