import type { TPomodoroState } from "./state";

export const pauseSession = (state: TPomodoroState): TPomodoroState => {
  if (state.activeSession === null) {
    return state;
  }

  return { ...state, activeSession: { ...state.activeSession, status: "paused" } };
};

export const resumeSession = (state: TPomodoroState): TPomodoroState => {
  if (state.activeSession === null) {
    return state;
  }

  return { ...state, activeSession: { ...state.activeSession, status: "running" } };
};
