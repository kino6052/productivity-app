import { createInitialState } from "@productivity-app/core/src/essence/state";
import type { TState } from "@productivity-app/core/src/essence/state";

export type TPhase = "work" | "break";
export type TSessionStatus = "running" | "paused";

export type TActiveSession = {
  itemId: string;
  phase: TPhase;
  remainingSeconds: number;
  status: TSessionStatus;
};

// Composes onto the shared TState rather than editing core's state.ts --
// "what's currently timing" isn't a fact about any one item (only one
// session runs at a time), so it doesn't belong on TItem as a facet either.
// Same composition-over-mutation rule conduit applies via TPaginationState.
export type TPomodoroState = TState & {
  activeSession: TActiveSession | null;
};

export const createInitialPomodoroState = (): TPomodoroState => ({
  ...createInitialState(),
  activeSession: null,
});
