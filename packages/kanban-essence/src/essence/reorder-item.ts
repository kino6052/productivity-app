import type { TState } from "@productivity-app/core/src/essence/state";

export const reorderItem = (state: TState, itemId: string, toIndex: number): TState => {
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (item === undefined || item.kanban === undefined) {
    return state;
  }

  const column = item.kanban.column;
  const columnItems = state.items
    .filter((candidate) => candidate.kanban?.column === column)
    .sort((a, b) => a.kanban!.order - b.kanban!.order);

  const withoutItem = columnItems.filter((candidate) => candidate.id !== itemId);
  const clampedIndex = Math.max(0, Math.min(toIndex, withoutItem.length));
  const reordered = [
    ...withoutItem.slice(0, clampedIndex),
    item,
    ...withoutItem.slice(clampedIndex),
  ];

  const newOrderById = new Map(reordered.map((candidate, index) => [candidate.id, index]));

  return {
    ...state,
    items: state.items.map((candidate) =>
      newOrderById.has(candidate.id) && candidate.kanban !== undefined
        ? { ...candidate, kanban: { ...candidate.kanban, order: newOrderById.get(candidate.id)! } }
        : candidate,
    ),
  };
};
