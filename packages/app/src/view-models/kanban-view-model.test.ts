import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { compileKanbanViewModel } from "./kanban-view-model";

describe("compileKanbanViewModel", () => {
  it("lists an unassigned item in the inbox", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compileKanbanViewModel(state, memory.getState, memory.setState);

    expect(vm.inbox).toHaveLength(1);
    expect(vm.inbox[0].title).toBe("Write report");
  });

  it("gives an inbox item a move button for every column", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compileKanbanViewModel(state, memory.getState, memory.setState);

    expect(vm.inbox[0].moveButtons.map((b) => b.columnLabel)).toEqual(["todo", "doing", "done"]);
  });

  it("clicking a move button actually moves the item via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileKanbanViewModel(state, memory.getState, memory.setState);

    vm.inbox[0].moveButtons.find((b) => b.columnLabel === "todo")!.onClick();

    expect(memory.getState().items[0].kanban).toEqual({ column: "todo", order: 0 });
  });

  it("lists a card under its actual column, without a move button back to that column", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const onBoard = moveItem(state, itemId, "todo");
    const memory = createMemoryState(onBoard);

    const vm = compileKanbanViewModel(onBoard, memory.getState, memory.setState);

    const todoColumn = vm.columns.find((c) => c.name === "todo")!;
    expect(todoColumn.cards).toHaveLength(1);
    expect(todoColumn.cards[0].moveButtons.map((b) => b.columnLabel)).toEqual(["doing", "done"]);
  });

  it("onRenameClick renames the card via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileKanbanViewModel(state, memory.getState, memory.setState);

    vm.inbox[0].onRenameClick("Write final report");

    expect(memory.getState().items[0].title).toBe("Write final report");
  });

  it("onDeleteClick removes the card via setState", () => {
    const state = addItem(createInitialState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compileKanbanViewModel(state, memory.getState, memory.setState);

    vm.inbox[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
  });

  // Real bug, found live: deleting an item from the Kanban view while its
  // pomodoro session was running left activeSession orphaned (pointing at
  // an id nothing could ever reach again), permanently blocking every
  // future startSession call -- this view's onDeleteItem had no idea
  // pomodoro sessions even exist. Fixed via the same shared
  // clearOrphanedPomodoroSession every mini-app view-model's onDeleteItem
  // now goes through.
  it("also clears an active pomodoro session if the deleted item was running it", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);
    const memory = createMemoryState(running);
    const vm = compileKanbanViewModel(running, memory.getState, memory.setState);

    vm.inbox[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
    expect(memory.getState().activeSession).toBeNull();
  });

  // Real bug, found live: manually moving an item straight to "done" from
  // this view (the "Move to done" button, independent of Pomodoro's own
  // Mark done / a natural timer completion) left activeSession pointing
  // at it -- the item still exists, just done, so startSession's own
  // orphan self-heal doesn't catch it, and every future Start silently
  // stopped working. "Done" itself is the trigger, not which button was
  // clicked to get there.
  it("also clears an active pomodoro session when moving that item to done specifically", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);
    const memory = createMemoryState(running);
    const vm = compileKanbanViewModel(running, memory.getState, memory.setState);

    vm.inbox[0].moveButtons.find((b) => b.columnLabel === "done")!.onClick();

    expect(memory.getState().items[0].kanban).toEqual({ column: "done", order: 0 });
    expect(memory.getState().activeSession).toBeNull();
  });

  it("does not touch an active pomodoro session when moving that item to a non-done column", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);
    const memory = createMemoryState(running);
    const vm = compileKanbanViewModel(running, memory.getState, memory.setState);

    vm.inbox[0].moveButtons.find((b) => b.columnLabel === "todo")!.onClick();

    expect(memory.getState().activeSession?.itemId).toBe(itemId);
  });

  it("leaves a different item's active session untouched when moving this item to done", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "Running"), "Other");
    const [running, other] = state.items;
    const withSession = startSession(state, running.id);
    const memory = createMemoryState(withSession);
    const vm = compileKanbanViewModel(withSession, memory.getState, memory.setState);

    vm.inbox.find((c) => c.id === other.id)!.moveButtons.find((b) => b.columnLabel === "done")!.onClick();

    expect(memory.getState().activeSession?.itemId).toBe(running.id);
  });
});
