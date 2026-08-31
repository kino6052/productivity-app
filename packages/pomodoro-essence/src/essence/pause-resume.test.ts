import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState } from "./state";
import { startSession } from "./start-session";
import { pauseSession, resumeSession } from "./pause-resume";

const stateWithRunningSession = () => {
  const state = addItem(createInitialPomodoroState(), "Write report");
  return startSession(state, state.items[0].id);
};

describe("pauseSession", () => {
  it("pauses a running session", () => {
    const state = stateWithRunningSession();

    const next = pauseSession(state);

    expect(next.activeSession?.status).toBe("paused");
  });

  it("is a no-op when there is no active session", () => {
    const state = createInitialPomodoroState();

    expect(pauseSession(state)).toEqual(state);
  });
});

describe("resumeSession", () => {
  it("resumes a paused session", () => {
    const paused = pauseSession(stateWithRunningSession());

    const next = resumeSession(paused);

    expect(next.activeSession?.status).toBe("running");
  });

  it("is a no-op when there is no active session", () => {
    const state = createInitialPomodoroState();

    expect(resumeSession(state)).toEqual(state);
  });
});
