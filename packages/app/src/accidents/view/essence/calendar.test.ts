import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { renderCalendar } from "./calendar";

const day = new Date("2026-09-01T00:00:00Z");

describe("renderCalendar", () => {
  it("shows the given day", () => {
    const html = renderCalendar(createInitialState(), day);

    expect(html).toContain("2026-09-01");
  });

  it("lists an item scheduled on that day, with an unschedule button", () => {
    const state = addItem(createInitialState(), "Team sync");
    const itemId = state.items[0].id;
    const scheduled = scheduleItem(state, itemId, day, day);

    const html = renderCalendar(scheduled, day);

    expect(html).toContain("Team sync");
    expect(html).toContain(`data-action="unschedule-item" data-item-id="${itemId}"`);
  });

  it("does not list an item scheduled on a different day", () => {
    const state = addItem(createInitialState(), "Team sync");
    const otherDay = new Date("2026-09-02T00:00:00Z");
    const scheduled = scheduleItem(state, state.items[0].id, otherDay, otherDay);

    const html = renderCalendar(scheduled, day);

    expect(html).not.toContain("Team sync");
  });

  it("lists an unscheduled item with a schedule-today button", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;

    const html = renderCalendar(state, day);

    expect(html).toContain(`data-action="schedule-item" data-item-id="${itemId}"`);
  });

  it("does not show a schedule button for an item already scheduled that day", () => {
    const state = addItem(createInitialState(), "Team sync");
    const itemId = state.items[0].id;
    const scheduled = scheduleItem(state, itemId, day, day);

    const html = renderCalendar(scheduled, day);

    expect(html).not.toContain(`data-action="schedule-item" data-item-id="${itemId}"`);
  });
});
