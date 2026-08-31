import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
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
    const itemId = state.items[0].id;
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
});
