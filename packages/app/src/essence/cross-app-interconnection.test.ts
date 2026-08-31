// No sibling source file on purpose: this suite doesn't introduce a new
// capability, it proves that capabilities already built independently in
// separate essence packages compose on one shared item with no glue code
// needed — the actual proof of "every entity usable in every app"
// (docs/checklist.md, Part 6).
import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { addNote } from "@productivity-app/notes-essence/src/essence/add-note";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { unscheduleItem } from "@productivity-app/calendar-essence/src/essence/unschedule-item";
import { selectItemsOnDay } from "@productivity-app/calendar-essence/src/essence/selectors";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";

describe("cross-app interconnection", () => {
  it("lets an item created via notes receive a kanban facet and appear on a board", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const withNote = addNote(state, itemId, "Outline the sections.");

    const onBoard = moveItem(withNote, itemId, "todo");

    expect(onBoard.items[0].note).toEqual({ body: "Outline the sections.", parentId: undefined });
    expect(onBoard.items[0].kanban).toEqual({ column: "todo", order: 0 });
  });

  it("lets an item with a kanban facet receive a calendar facet and appear on a day", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const onBoard = moveItem(state, itemId, "todo");
    const start = new Date("2026-09-01T10:00:00Z");
    const end = new Date("2026-09-01T10:30:00Z");

    const scheduled = scheduleItem(onBoard, itemId, start, end);

    expect(selectItemsOnDay(scheduled, new Date("2026-09-01T00:00:00Z"))).toEqual([scheduled.items[0]]);
    expect(scheduled.items[0].kanban).toEqual({ column: "todo", order: 0 });
  });

  it("lets an item with a calendar facet receive a pomodoro facet and be timed", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const start = new Date("2026-09-01T10:00:00Z");
    const end = new Date("2026-09-01T10:30:00Z");
    const scheduled = scheduleItem(state, itemId, start, end);
    const pomodoroState: TPomodoroState = { ...scheduled, activeSession: null };

    const running = startSession(pomodoroState, itemId);

    expect(running.activeSession?.itemId).toBe(itemId);
    expect(running.items[0].calendar).toEqual({ start, end });
  });

  it("leaves other facets intact when one facet is removed", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const start = new Date("2026-09-01T10:00:00Z");
    const end = new Date("2026-09-01T10:30:00Z");
    const onBoard = moveItem(state, itemId, "todo");
    const scheduled = scheduleItem(onBoard, itemId, start, end);
    const withNote = addNote(scheduled, itemId, "Outline the sections.");

    const unscheduled = unscheduleItem(withNote, itemId);

    expect(unscheduled.items[0].calendar).toBeUndefined();
    expect(unscheduled.items[0].kanban).toEqual({ column: "todo", order: 0 });
    expect(unscheduled.items[0].note).toEqual({ body: "Outline the sections.", parentId: undefined });
  });
});
