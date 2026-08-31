import type { TItem, TState } from "@productivity-app/core/src/essence/state";

export const selectItemsByColumn = (state: TState, column: string): TItem[] =>
  state.items
    .filter((item) => item.kanban?.column === column)
    .sort((a, b) => a.kanban!.order - b.kanban!.order);

export const selectColumns = (state: TState): string[] => {
  const columns: string[] = [];
  for (const item of state.items) {
    if (item.kanban !== undefined && !columns.includes(item.kanban.column)) {
      columns.push(item.kanban.column);
    }
  }
  return columns;
};
