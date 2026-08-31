import type { TItem, TState } from "@productivity-app/core/src/essence/state";

const withoutCalendar = (item: TItem): TItem => {
  const { calendar, ...rest } = item;
  return rest;
};

// Generic over S -- see core/essence/item.ts's addItem for why.
export const unscheduleItem = <S extends TState>(state: S, itemId: string): S =>
  ({
    ...state,
    items: state.items.map((item) => (item.id === itemId ? withoutCalendar(item) : item)),
  }) as S;
