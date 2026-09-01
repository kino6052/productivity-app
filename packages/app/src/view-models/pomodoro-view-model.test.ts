import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { compilePomodoroViewModel, onTick } from "./pomodoro-view-model";

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

  it("onRenameClick renames the item via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onRenameClick("Write final report");

    expect(memory.getState().items[0]).toEqual({ ...state.items[0], title: "Write final report" });
    expect(memory.getState().items[0].id).toBe(itemId);
  });

  it("onDeleteClick removes the item via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
  });

  it("onStartClick also moves the item to kanban's doing column (cross-app sync)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onStartClick!();

    expect(memory.getState().items[0].kanban).toEqual({ column: "doing", order: 0 });
  });

  it("does not touch kanban when starting is rejected (a session is already running)", () => {
    const other = addItem(addItem(createInitialPomodoroState(), "Write report"), "Second item");
    const memory = createMemoryState(other);
    const vm = compilePomodoroViewModel(other, memory.getState, memory.setState);
    vm.items[0].onStartClick!();

    compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState).items[1].onStartClick!();

    expect(memory.getState().items[1].kanban).toBeUndefined();
  });
});

describe("onTick", () => {
  it("is a no-op (doesn't call setState) when tick() itself is a no-op", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    let setStateCalls = 0;
    const setState = (next: typeof state) => {
      setStateCalls += 1;
      memory.setState(next);
    };

    onTick(memory.getState, setState);

    expect(setStateCalls).toBe(0);
  });

  it("decrements the running session without touching kanban", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running: TPomodoroState = {
      ...state,
      activeSession: { itemId, phase: "work", remainingSeconds: 10, status: "running" },
    };
    const memory = createMemoryState(running);

    onTick(memory.getState, memory.setState);

    expect(memory.getState().activeSession?.remainingSeconds).toBe(9);
    expect(memory.getState().items[0].kanban).toBeUndefined();
  });

  it("moves the item to kanban's done column when a work phase finishes (cross-app sync)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const aboutToFinish: TPomodoroState = {
      ...state,
      activeSession: { itemId, phase: "work", remainingSeconds: 1, status: "running" },
    };
    const memory = createMemoryState(aboutToFinish);

    onTick(memory.getState, memory.setState);

    expect(memory.getState().activeSession?.phase).toBe("break");
    expect(memory.getState().items[0].kanban).toEqual({ column: "done", order: 0 });
  });
});
