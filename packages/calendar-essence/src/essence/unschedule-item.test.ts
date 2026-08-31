import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { scheduleItem } from "./schedule-item";
import { unscheduleItem } from "./unschedule-item";

describe("unscheduleItem", () => {
  it("removes the calendar facet from the item", () => {
    const state = addItem(createInitialState(), "Team sync");
    const scheduled = scheduleItem(state, state.items[0].id, new Date(), new Date());

    const next = unscheduleItem(scheduled, state.items[0].id);

    expect(next.items[0].calendar).toBeUndefined();
  });

  it("leaves other items untouched", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const scheduled = scheduleItem(state, state.items[0].id, new Date(), new Date());
    const bothScheduled = scheduleItem(scheduled, state.items[1].id, new Date(), new Date());

    const next = unscheduleItem(bothScheduled, state.items[0].id);

    expect(next.items[1].calendar).toEqual(bothScheduled.items[1].calendar);
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Team sync");
    const scheduled = scheduleItem(state, state.items[0].id, new Date(), new Date());

    const next = unscheduleItem(scheduled, "missing");

    expect(next.items).toEqual(scheduled.items);
  });
});
