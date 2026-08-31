import type { TState } from "@productivity-app/core/src/essence/state";

// Generic over S -- see core/essence/item.ts's addItem for why.
export const scheduleItem = <S extends TState>(state: S, itemId: string, start: Date, end: Date): S =>
  ({
    ...state,
    items: state.items.map((item) => (item.id === itemId ? { ...item, calendar: { start, end } } : item)),
  }) as S;
