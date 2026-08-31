import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { completeSession } from "@productivity-app/pomodoro-essence/src/essence/complete-session";
import { renderPomodoro } from "./pomodoro";

describe("renderPomodoro", () => {
  it("lists each item's title", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");

    const html = renderPomodoro(state);

    expect(html).toContain("Write report");
  });

  it("shows a start button for an item with no active session", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;

    const html = renderPomodoro(state);

    expect(html).toContain(`data-action="start-session" data-item-id="${itemId}"`);
  });

  it("shows the running timer and a pause button for the active item, not a start button", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);

    const html = renderPomodoro(running);

    expect(html).toContain("25:00");
    expect(html).toContain("work");
    expect(html).toContain(`data-action="pause-session"`);
    expect(html).not.toContain(`data-action="start-session" data-item-id="${itemId}"`);
  });

  it("shows a resume button instead of pause when the session is paused", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const paused = pauseSession(startSession(state, state.items[0].id));

    const html = renderPomodoro(paused);

    expect(html).toContain(`data-action="resume-session"`);
    expect(html).not.toContain(`data-action="pause-session"`);
  });

  it("shows the completed count for an item with a pomodoro facet", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const completed = completeSession(state, state.items[0].id);

    const html = renderPomodoro(completed);

    expect(html).toContain("1 completed");
  });

  it("shows zero completed for an item with no pomodoro facet yet", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");

    const html = renderPomodoro(state);

    expect(html).toContain("0 completed");
  });
});
