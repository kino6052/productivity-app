import type { TPomodoroState } from "./state";
import { WORK_DURATION_SECONDS } from "./constants";

export const startSession = (state: TPomodoroState, itemId: string): TPomodoroState => {
  if (state.activeSession !== null) {
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
