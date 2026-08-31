import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState } from "./state";
import { completeSession } from "./complete-session";

describe("completeSession", () => {
  it("gives the item a pomodoro facet with one completed session", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;

    const next = completeSession(state, itemId);

    expect(next.items[0].pomodoro).toEqual({ estimatedCount: 0, completedCount: 1 });
  });

  it("increments an existing completedCount", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const withOne = completeSession(state, itemId);

    const withTwo = completeSession(withOne, itemId);

    expect(withTwo.items[0].pomodoro).toEqual({ estimatedCount: 0, completedCount: 2 });
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");

    const next = completeSession(state, "missing");

    expect(next.items).toEqual(state.items);
  });
});
