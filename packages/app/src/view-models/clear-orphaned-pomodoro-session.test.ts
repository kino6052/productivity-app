import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { removeItem } from "@productivity-app/core/src/essence/remove-item";
import { clearOrphanedPomodoroSession } from "./clear-orphaned-pomodoro-session";

describe("clearOrphanedPomodoroSession", () => {
  it("clears activeSession when the given item id is the one currently running", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);
    const withItemRemoved = removeItem(running, itemId);

    const cleared = clearOrphanedPomodoroSession(withItemRemoved, itemId);

    expect(cleared.activeSession).toBeNull();
  });

  it("leaves activeSession untouched when a different item is deleted", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "Running"), "Other");
    const [running, other] = state.items;
    const withSession = startSession(state, running.id);
    const withOtherRemoved = removeItem(withSession, other.id);

    const result = clearOrphanedPomodoroSession(withOtherRemoved, other.id);

    expect(result.activeSession?.itemId).toBe(running.id);
  });

  it("leaves activeSession untouched when there is no active session", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;

    const result = clearOrphanedPomodoroSession(state, itemId);

    expect(result.activeSession).toBeNull();
  });

  it("is a safe no-op on plain TState (no pomodoro facet at all)", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;

    const result = clearOrphanedPomodoroSession(state, itemId);

    expect(result).toBe(state);
  });
});
