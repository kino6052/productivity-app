import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { moveItem } from "./move-item";

describe("moveItem", () => {
  it("gives a fresh item a kanban facet at the end of the destination column", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;

    const next = moveItem(state, itemId, "todo");

    expect(next.items[0].kanban).toEqual({ column: "todo", order: 0 });
  });

  it("appends after items already in the destination column", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const withFirst = moveItem(state, state.items[0].id, "todo");

    const withBoth = moveItem(withFirst, state.items[1].id, "todo");

    expect(withBoth.items[1].kanban).toEqual({ column: "todo", order: 1 });
  });

  it("moves an item already in a column to a new column, appended at the end", () => {
    const state = addItem(createInitialState(), "Write report");
    const inTodo = moveItem(state, state.items[0].id, "todo");

    const inDone = moveItem(inTodo, state.items[0].id, "done");

    expect(inDone.items[0].kanban).toEqual({ column: "done", order: 0 });
  });
});
