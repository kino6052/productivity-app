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

  // Requested: starting a different item while one is already running
  // switches to it -- stops/resets whatever was active and starts the
  // one just clicked, rather than silently rejecting the click. This
  // also means an item's in-progress time is simply not preserved once
  // you switch away from it -- there's nowhere else for it to live, since
  // activeSession is the one place a session's progress is tracked at
  // all (see state.ts's own reasoning for why it's not a per-item field).
  it("switches to a different item, replacing whichever session was previously active", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "a"), "b");
    const [first, second] = state.items;
    const withFirst = startSession(state, first.id);

    const withSecond = startSession(withFirst, second.id);

    expect(withSecond.activeSession).toEqual({
      itemId: second.id,
      phase: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      status: "running",
    });
  });

  // Switching resets progress -- the newly started item always gets a
  // full, fresh work phase, never picking up wherever the previous
  // session happened to be (partway through work, or mid-break).
  it("gives the newly started item a fresh full-length work phase, even if the previous session was mid-break", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "a"), "b");
    const [first, second] = state.items;
    const midBreak = {
      ...startSession(state, first.id),
      activeSession: { itemId: first.id, phase: "break" as const, remainingSeconds: 42, status: "running" as const },
    };

    const withSecond = startSession(midBreak, second.id);

    expect(withSecond.activeSession).toEqual({
      itemId: second.id,
      phase: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      status: "running",
    });
  });

  // Starting the item that's already the active one is a no-op -- it
  // doesn't reset its own in-progress time. The UI never offers a Start
  // button for the currently active item in the first place (presence-
  // gated in the view-model), but this keeps the essence function itself
  // safe to call directly without that assumption.
  it("does not reset the active item's own progress if it's started again", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const midSession = {
      ...startSession(state, itemId),
      activeSession: { itemId, phase: "work" as const, remainingSeconds: 42, status: "running" as const },
    };

    const next = startSession(midSession, itemId);

    expect(next).toBe(midSession);
  });

  it("starts a session even if nothing was previously active, including for an item that no longer exists in state.items", () => {
    // Not a special case any more -- switching always works regardless
    // of what (if anything) the previous activeSession pointed at.
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
