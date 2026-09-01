import type { TPomodoroState } from "./state";
import { WORK_DURATION_SECONDS } from "./constants";

export const startSession = (state: TPomodoroState, itemId: string): TPomodoroState => {
  // Only block a new session if the current one still belongs to a real
  // item. An orphaned session (its item was deleted without going
  // through onDeleteItem's own activeSession cleanup, or by any other
  // path that doesn't know pomodoro sessions exist) would otherwise block
  // every future session forever, with nothing in the UI able to clear
  // it -- its pause/resume controls only ever render for an item that
  // still exists.
  const activeItemStillExists =
    state.activeSession !== null && state.items.some((item) => item.id === state.activeSession!.itemId);
  if (activeItemStillExists) {
    return state;
  }

  return {
    ...state,
    activeSession: {
      itemId,
      phase: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      status: "running",
    },
  };
};
