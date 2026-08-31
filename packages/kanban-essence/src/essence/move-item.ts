import type { TState } from "@productivity-app/core/src/essence/state";

// Generic over S -- so a composed state like pomodoro-essence's
// TPomodoroState flows through unchanged (see core/item.ts's addItem).
export const moveItem = <S extends TState>(state: S, itemId: string, toColumn: string): S => {
  const order = state.items.filter(
    (item) => item.id !== itemId && item.kanban?.column === toColumn,
  ).length;

  return {
    ...state,
    items: state.items.map((item) =>
      item.id === itemId ? { ...item, kanban: { column: toColumn, order } } : item,
    ),
  } as S;
};
