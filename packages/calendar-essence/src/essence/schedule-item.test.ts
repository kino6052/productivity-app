import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { scheduleItem } from "./schedule-item";

describe("scheduleItem", () => {
  it("gives the item a calendar facet with the given start and end", () => {
    const state = addItem(createInitialState(), "Team sync");
    const start = new Date("2026-09-01T10:00:00Z");
    const end = new Date("2026-09-01T10:30:00Z");

    const next = scheduleItem(state, state.items[0].id, start, end);

    expect(next.items[0].calendar).toEqual({ start, end });
  });

  it("replaces an existing calendar facet", () => {
    const state = addItem(createInitialState(), "Team sync");
    const itemId = state.items[0].id;
    const firstStart = new Date("2026-09-01T10:00:00Z");
    const firstEnd = new Date("2026-09-01T10:30:00Z");
    const scheduled = scheduleItem(state, itemId, firstStart, firstEnd);

    const secondStart = new Date("2026-09-02T09:00:00Z");
    const secondEnd = new Date("2026-09-02T09:30:00Z");
    const rescheduled = scheduleItem(scheduled, itemId, secondStart, secondEnd);

    expect(rescheduled.items[0].calendar).toEqual({ start: secondStart, end: secondEnd });
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Team sync");

    const next = scheduleItem(state, "missing", new Date(), new Date());

    expect(next.items).toEqual(state.items);
  });
});
