import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { compilePomodoroViewModel } from "./pomodoro-view-model";

describe("compilePomodoroViewModel", () => {
  it("compiles one row per item, with a completed label", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    expect(vm.items).toHaveLength(1);
    expect(vm.items[0].title).toBe("Write report");
    expect(vm.items[0].completedLabel).toBe("0 completed");
  });

  it("gives an item with no active session a start action and no session view-model", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    expect(vm.items[0].onStartClick).toBeInstanceOf(Function);
    expect(vm.items[0].session).toBeUndefined();
  });

  it("onStartClick starts a real session via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onStartClick!();

    expect(memory.getState().activeSession?.itemId).toBe(itemId);
  });

  it("gives the active item no start action, and a running session view-model", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();

    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    expect(vm.items[0].onStartClick).toBeUndefined();
    expect(vm.items[0].session).toEqual({
      phaseLabel: "work",
      remainingLabel: "25:00",
      onPauseClick: expect.any(Function),
      onResumeClick: undefined,
    });
  });

  it("the session's onPauseClick pauses via setState, flipping which action is present", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();
    const running = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    running.items[0].session!.onPauseClick!();

    const paused = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);
    expect(paused.items[0].session).toEqual({
      phaseLabel: "work",
      remainingLabel: "25:00",
      onPauseClick: undefined,
      onResumeClick: expect.any(Function),
    });
  });
});
