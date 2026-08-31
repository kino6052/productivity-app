import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { compileCalendarViewModel } from "./calendar-view-model";

const day = new Date("2026-09-01T00:00:00Z");

describe("compileCalendarViewModel", () => {
  it("shows the day label", () => {
    const memory = createMemoryState(createInitialState());

    const vm = compileCalendarViewModel(createInitialState(), day, memory.getState, memory.setState);

    expect(vm.dayLabel).toBe("2026-09-01");
  });

  it("lists an unscheduled item with a schedule action", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compileCalendarViewModel(state, day, memory.getState, memory.setState);

    expect(vm.unscheduled).toHaveLength(1);
    expect(vm.unscheduled[0].onScheduleClick).toBeInstanceOf(Function);
    expect(vm.scheduledToday).toHaveLength(0);
  });

  it("onScheduleClick actually schedules the item on the given day via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileCalendarViewModel(state, day, memory.getState, memory.setState);

    vm.unscheduled[0].onScheduleClick!();

    expect(memory.getState().items[0].calendar).toEqual({ start: day, end: day });
  });

  it("lists an item scheduled that day with an unschedule action, and not as unscheduled", () => {
    const state = addItem(createInitialState(), "Write report");
    const scheduled = scheduleItem(state, state.items[0].id, day, day);
    const memory = createMemoryState(scheduled);

    const vm = compileCalendarViewModel(scheduled, day, memory.getState, memory.setState);

    expect(vm.scheduledToday).toHaveLength(1);
    expect(vm.scheduledToday[0].onUnscheduleClick).toBeInstanceOf(Function);
    expect(vm.unscheduled).toHaveLength(0);
  });

  it("onUnscheduleClick actually unschedules via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const scheduled = scheduleItem(state, itemId, day, day);
    const memory = createMemoryState(scheduled);
    const vm = compileCalendarViewModel(scheduled, day, memory.getState, memory.setState);

    vm.scheduledToday[0].onUnscheduleClick!();

    expect(memory.getState().items[0].calendar).toBeUndefined();
  });
});
