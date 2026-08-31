import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { scheduleItem } from "./schedule-item";
import { selectItemsOnDay } from "./selectors";

describe("selectItemsOnDay", () => {
  it("returns items whose start falls on the given day", () => {
    const state = addItem(createInitialState(), "Team sync");
    const scheduled = scheduleItem(
      state,
      state.items[0].id,
      new Date("2026-09-01T10:00:00Z"),
      new Date("2026-09-01T10:30:00Z"),
    );

    const results = selectItemsOnDay(scheduled, new Date("2026-09-01T00:00:00Z"));

    expect(results).toEqual([scheduled.items[0]]);
  });

  it("excludes items starting on a different day", () => {
    const state = addItem(createInitialState(), "Team sync");
    const scheduled = scheduleItem(
      state,
      state.items[0].id,
      new Date("2026-09-01T10:00:00Z"),
      new Date("2026-09-01T10:30:00Z"),
    );

    const results = selectItemsOnDay(scheduled, new Date("2026-09-02T00:00:00Z"));

    expect(results).toEqual([]);
  });

  it("excludes items with no calendar facet", () => {
    const state = addItem(createInitialState(), "not scheduled");

    const results = selectItemsOnDay(state, new Date("2026-09-01T00:00:00Z"));

    expect(results).toEqual([]);
  });
});
