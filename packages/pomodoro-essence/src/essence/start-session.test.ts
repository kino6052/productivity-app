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

  // Real bug, found live: deleting an item while its session is running
  // (removeItem has no idea a pomodoro session even exists -- it's
  // TPomodoroState's own field, not on TItem) leaves activeSession
  // pointing at an id that no longer exists in state.items. Nothing in
  // the UI can ever clear that (the session's own pause/resume controls
  // only render for an item that still exists), so without this,
  // starting *any* future session is permanently blocked. onDeleteItem
  // (pomodoro-view-model.ts) now also clears activeSession up front when
  // deleting its own item, but this self-heals any state that already
  // got orphaned before that fix existed, or by any other path that
  // might remove an item without knowing about pomodoro sessions.
  it("starts a new session even if the current one belongs to an item that no longer exists", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const withOrphanedSession = {
      ...startSession(state, itemId),
      items: [], // the item was deleted out from under its own session
    };

    const next = startSession(withOrphanedSession, "some-new-item-id");

    expect(next.activeSession?.itemId).toBe("some-new-item-id");
  });
});
