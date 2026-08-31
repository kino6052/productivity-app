import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState } from "./state";
import { startSession } from "./start-session";
import { WORK_DURATION_SECONDS } from "./constants";

describe("startSession", () => {
  it("attaches a running work session for the given item", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;

    const next = startSession(state, itemId);

    expect(next.activeSession).toEqual({
      itemId,
      phase: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      status: "running",
    });
  });

  it("does not start a second session while one is already active", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "a"), "b");
    const [first, second] = state.items;

    const withFirst = startSession(state, first.id);
    const withSecondAttempt = startSession(withFirst, second.id);

    expect(withSecondAttempt.activeSession?.itemId).toBe(first.id);
  });
});
