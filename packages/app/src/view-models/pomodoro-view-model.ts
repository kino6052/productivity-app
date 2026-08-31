// Conduit's view-model.ts pattern: pure functions that turn essence state
// into a typed, framework-agnostic object tree -- action closures already
// bound, so a real UI component (Solid, eventually) just reads props and
// calls callbacks, and a test can assert on the returned tree directly
// instead of string-matching rendered HTML (that's what
// accidents/view/essence/pomodoro.ts is for -- a separate, independent
// tier, same as conduit keeps its essence-view and its react view-model
// as two parallel representations of the same essence, neither depending
// on the other).
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession, resumeSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { formatDuration } from "../accidents/view/essence/format-duration";

export type TGetState = () => TPomodoroState;
export type TSetState = (next: TPomodoroState) => void;

export const onStartSession = (itemId: string, getState: TGetState, setState: TSetState): void => {
  setState(startSession(getState(), itemId));
};

export const onPauseSession = (getState: TGetState, setState: TSetState): void => {
  setState(pauseSession(getState()));
};

export const onResumeSession = (getState: TGetState, setState: TSetState): void => {
  setState(resumeSession(getState()));
};

export type TPomodoroSessionViewModel = {
  phaseLabel: string;
  remainingLabel: string;
  // Presence, not a flag -- same rule as conduit's onDeleteClick: exactly
  // one of these two is ever defined, and which one is the only signal a
  // consumer needs.
  onPauseClick: (() => void) | undefined;
  onResumeClick: (() => void) | undefined;
};

export type TPomodoroItemViewModel = {
  id: string;
  title: string;
  completedLabel: string;
  // undefined when this item already has the running session -- presence
  // gates the control, same rule as above.
  onStartClick: (() => void) | undefined;
  session: TPomodoroSessionViewModel | undefined;
};

export type TPomodoroViewModel = {
  items: TPomodoroItemViewModel[];
};

const compileSessionViewModel = (
  session: NonNullable<TPomodoroState["activeSession"]>,
  getState: TGetState,
  setState: TSetState,
): TPomodoroSessionViewModel => ({
  phaseLabel: session.phase,
  remainingLabel: formatDuration(session.remainingSeconds),
  onPauseClick: session.status === "running" ? () => onPauseSession(getState, setState) : undefined,
  onResumeClick: session.status === "paused" ? () => onResumeSession(getState, setState) : undefined,
});

export const compilePomodoroViewModel = (
  state: TPomodoroState,
  getState: TGetState,
  setState: TSetState,
): TPomodoroViewModel => ({
  items: state.items.map((item) => {
    const isActive = state.activeSession?.itemId === item.id;
    return {
      id: item.id,
      title: item.title,
      completedLabel: `${item.pomodoro?.completedCount ?? 0} completed`,
      onStartClick: isActive ? undefined : () => onStartSession(item.id, getState, setState),
      session: isActive ? compileSessionViewModel(state.activeSession!, getState, setState) : undefined,
    };
  }),
});
