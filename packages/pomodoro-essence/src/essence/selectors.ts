import type { TItem } from "@productivity-app/core/src/essence/state";
import type { TActiveSession, TPomodoroState } from "./state";

export const selectActiveSession = (state: TPomodoroState): TActiveSession | null => state.activeSession;

export const selectItemsWithPomodoro = (state: TPomodoroState): TItem[] =>
  state.items.filter((item) => item.pomodoro !== undefined);
