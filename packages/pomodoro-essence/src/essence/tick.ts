import type { TPomodoroState } from "./state";
import { completeSession } from "./complete-session";
import { BREAK_DURATION_SECONDS, WORK_DURATION_SECONDS } from "./constants";

export const tick = (state: TPomodoroState): TPomodoroState => {
  const session = state.activeSession;
  if (session === null || session.status !== "running") {
    return state;
  }

  if (session.remainingSeconds > 1) {
    return {
      ...state,
      activeSession: { ...session, remainingSeconds: session.remainingSeconds - 1 },
    };
  }

  if (session.phase === "work") {
    return {
      ...completeSession(state, session.itemId),
      activeSession: { ...session, phase: "break", remainingSeconds: BREAK_DURATION_SECONDS },
    };
  }

  return {
    ...state,
    activeSession: { ...session, phase: "work", remainingSeconds: WORK_DURATION_SECONDS },
  };
};
