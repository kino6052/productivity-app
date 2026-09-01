import type { TPomodoroState } from "./state";
import { WORK_DURATION_SECONDS } from "./constants";

// Requested: starting a different item while one is already active
// switches to it -- stops/resets whatever was running and starts the one
// just clicked, rather than rejecting the click. Only starting the item
// that's *already* the active one is a no-op (doesn't reset its own
// in-progress time); every other case just replaces activeSession
// outright, always with a fresh full-length work phase. This also
// retires the essence-level "orphaned/stale session" self-heal a couple
// of parts of this project's history built up (docs/checklist.md, Parts
// 14-15): there's no more "blocked" state left to guard against, since
// switching always wins regardless of what the previous activeSession
// pointed at or whether that item still exists.
export const startSession = (state: TPomodoroState, itemId: string): TPomodoroState => {
  if (state.activeSession?.itemId === itemId) {
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
