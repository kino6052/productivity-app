import type { TState } from "./state";

// Generic over S -- see item.ts's addItem for why.
export const removeItem = <S extends TState>(state: S, id: string): S =>
  ({
    ...state,
    items: state.items.filter((item) => item.id !== id),
  }) as S;
