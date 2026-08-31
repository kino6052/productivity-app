import type { TState } from "@productivity-app/core/src/essence/state";

export const moveItem = (state: TState, itemId: string, toColumn: string): TState => {
  const order = state.items.filter(
    (item) => item.id !== itemId && item.kanban?.column === toColumn,
  ).length;

  return {
    ...state,
    items: state.items.map((item) =>
      item.id === itemId ? { ...item, kanban: { column: toColumn, order } } : item,
    ),
  };
};
