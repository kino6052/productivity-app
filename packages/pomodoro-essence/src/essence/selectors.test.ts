import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState } from "./state";
import { startSession } from "./start-session";
import { completeSession } from "./complete-session";
import { selectActiveSession, selectItemsWithPomodoro } from "./selectors";

describe("selectActiveSession", () => {
  it("returns null when nothing is running", () => {
    expect(selectActiveSession(createInitialPomodoroState())).toBeNull();
  });

  it("returns the active session when one is running", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const running = startSession(state, state.items[0].id);

    expect(selectActiveSession(running)).toEqual(running.activeSession);
  });
});

describe("selectItemsWithPomodoro", () => {
  it("returns only items that have a pomodoro facet", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "a"), "b");
    const withOneCompleted = completeSession(state, state.items[0].id);

    expect(selectItemsWithPomodoro(withOneCompleted)).toEqual([withOneCompleted.items[0]]);
  });
});
