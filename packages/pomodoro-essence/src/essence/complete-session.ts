import type { TPomodoroState } from "./state";

export const completeSession = (state: TPomodoroState, itemId: string): TPomodoroState => ({
  ...state,
  items: state.items.map((item) =>
    item.id === itemId
      ? {
          ...item,
          pomodoro: {
            estimatedCount: item.pomodoro?.estimatedCount ?? 0,
            completedCount: (item.pomodoro?.completedCount ?? 0) + 1,
          },
        }
      : item,
  ),
});
