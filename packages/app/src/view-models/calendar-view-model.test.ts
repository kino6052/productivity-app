import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { compileCalendarViewModel } from "./calendar-view-model";

const day = new Date("2026-09-01T00:00:00Z"); // a Tuesday

describe("compileCalendarViewModel — day mode", () => {
  it("shows the day as the range label, and one day entry", () => {
    const memory = createMemoryState(createInitialState());

    const vm = compileCalendarViewModel(createInitialState(), day, "day", memory.getState, memory.setState);

    expect(vm.mode).toBe("day");
    expect(vm.rangeLabel).toBe("2026-09-01");
    expect(vm.days).toHaveLength(1);
    expect(vm.days[0].dayLabel).toBe("2026-09-01");
  });

  it("lists an unscheduled item with a schedule action", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compileCalendarViewModel(state, day, "day", memory.getState, memory.setState);

    expect(vm.unscheduled).toHaveLength(1);
    expect(vm.unscheduled[0].onScheduleClick).toBeInstanceOf(Function);
    expect(vm.days[0].items).toHaveLength(0);
  });

  it("onScheduleClick actually schedules the item on the reference day via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileCalendarViewModel(state, day, "day", memory.getState, memory.setState);

    vm.unscheduled[0].onScheduleClick!();

    expect(memory.getState().items[0].calendar).toEqual({ start: day, end: day });
  });

  it("lists an item scheduled that day with an unschedule action, and not as unscheduled", () => {
    const state = addItem(createInitialState(), "Write report");
    const scheduled = scheduleItem(state, state.items[0].id, day, day);
    const memory = createMemoryState(scheduled);

    const vm = compileCalendarViewModel(scheduled, day, "day", memory.getState, memory.setState);

    expect(vm.days[0].items).toHaveLength(1);
    expect(vm.days[0].items[0].onUnscheduleClick).toBeInstanceOf(Function);
    expect(vm.unscheduled).toHaveLength(0);
  });

  it("onUnscheduleClick actually unschedules via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const scheduled = scheduleItem(state, itemId, day, day);
    const memory = createMemoryState(scheduled);
    const vm = compileCalendarViewModel(scheduled, day, "day", memory.getState, memory.setState);

    vm.days[0].items[0].onUnscheduleClick!();

    expect(memory.getState().items[0].calendar).toBeUndefined();
  });

  it("onRenameClick renames the item via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileCalendarViewModel(state, day, "day", memory.getState, memory.setState);

    vm.unscheduled[0].onRenameClick("Write final report");

    expect(memory.getState().items[0].title).toBe("Write final report");
  });

  it("onDeleteClick removes the item via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileCalendarViewModel(state, day, "day", memory.getState, memory.setState);

    vm.unscheduled[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
  });
});

describe("compileCalendarViewModel — week mode", () => {
  it("shows a Monday–Sunday range label and 7 day entries", () => {
    const memory = createMemoryState(createInitialState());

    const vm = compileCalendarViewModel(createInitialState(), day, "week", memory.getState, memory.setState);

    expect(vm.mode).toBe("week");
    expect(vm.rangeLabel).toBe("2026-08-31 – 2026-09-06");
    expect(vm.days).toHaveLength(7);
    expect(vm.days.map((d) => d.dayLabel)).toEqual([
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ]);
  });

  it("groups a scheduled item under its own day within the week", () => {
    const state = addItem(createInitialState(), "Write report");
    const wednesday = new Date("2026-09-02T00:00:00Z");
    const scheduled = scheduleItem(state, state.items[0].id, wednesday, wednesday);
    const memory = createMemoryState(scheduled);

    const vm = compileCalendarViewModel(scheduled, day, "week", memory.getState, memory.setState);

    const wedIndex = vm.days.findIndex((d) => d.dayLabel === "2026-09-02");
    expect(vm.days[wedIndex].items).toHaveLength(1);
    expect(vm.days[wedIndex].items[0].title).toBe("Write report");
    // No other day in the week picked it up.
    expect(vm.days.filter((_, i) => i !== wedIndex).every((d) => d.items.length === 0)).toBe(true);
  });

  it("schedule from week mode still targets the reference day, not the first day of the week", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileCalendarViewModel(state, day, "week", memory.getState, memory.setState);

    vm.unscheduled[0].onScheduleClick!();

    expect(memory.getState().items[0].calendar).toEqual({ start: day, end: day });
  });
});

describe("compileCalendarViewModel — month mode", () => {
  it("shows a YYYY-MM range label and one day entry per day in the month", () => {
    const memory = createMemoryState(createInitialState());

    const vm = compileCalendarViewModel(createInitialState(), day, "month", memory.getState, memory.setState);

    expect(vm.mode).toBe("month");
    expect(vm.rangeLabel).toBe("2026-09");
    expect(vm.days).toHaveLength(30);
    expect(vm.days[0].dayLabel).toBe("2026-09-01");
    expect(vm.days[29].dayLabel).toBe("2026-09-30");
  });

  it("groups a scheduled item under its own day within the month", () => {
    const state = addItem(createInitialState(), "Write report");
    const laterInMonth = new Date("2026-09-20T00:00:00Z");
    const scheduled = scheduleItem(state, state.items[0].id, laterInMonth, laterInMonth);
    const memory = createMemoryState(scheduled);

    const vm = compileCalendarViewModel(scheduled, day, "month", memory.getState, memory.setState);

    const dayIndex = vm.days.findIndex((d) => d.dayLabel === "2026-09-20");
    expect(vm.days[dayIndex].items).toHaveLength(1);
  });
});
