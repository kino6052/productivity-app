import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState } from "./state";
import { startSession } from "./start-session";
import { tick } from "./tick";
import { BREAK_DURATION_SECONDS, WORK_DURATION_SECONDS } from "./constants";

const stateWithRunningSession = () => {
  const state = addItem(createInitialPomodoroState(), "Write report");
  return startSession(state, state.items[0].id);
};

describe("tick", () => {
  it("is a no-op when there is no active session", () => {
    const state = createInitialPomodoroState();

    expect(tick(state)).toEqual(state);
  });

  it("is a no-op when the active session is paused", () => {
    const running = stateWithRunningSession();
    const paused = { ...running, activeSession: { ...running.activeSession!, status: "paused" as const } };

    expect(tick(paused)).toEqual(paused);
  });

  it("decrements the remaining time by one second", () => {
    const state = stateWithRunningSession();

    const next = tick(state);

    expect(next.activeSession?.remainingSeconds).toBe(WORK_DURATION_SECONDS - 1);
    expect(next.activeSession?.phase).toBe("work");
  });

  it("flips from work to break and completes the session when time runs out", () => {
    const running = stateWithRunningSession();
    const oneSecondLeft = {
      ...running,
      activeSession: { ...running.activeSession!, remainingSeconds: 1 },
    };

    const next = tick(oneSecondLeft);

    expect(next.activeSession).toEqual({
      itemId: running.activeSession!.itemId,
      phase: "break",
      remainingSeconds: BREAK_DURATION_SECONDS,
      status: "running",
    });
    expect(next.items[0].pomodoro).toEqual({ estimatedCount: 0, completedCount: 1 });
  });

  it("flips from break back to work without completing another session", () => {
    const running = stateWithRunningSession();
    const onBreak = {
      ...running,
      activeSession: { ...running.activeSession!, phase: "break" as const, remainingSeconds: 1 },
    };

    const next = tick(onBreak);

    expect(next.activeSession).toEqual({
      itemId: running.activeSession!.itemId,
      phase: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      status: "running",
    });
    expect(next.items[0].pomodoro).toBeUndefined();
  });
});
