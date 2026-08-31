import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { moveItem } from "./move-item";
import { selectColumns, selectItemsByColumn } from "./selectors";

describe("selectItemsByColumn", () => {
  it("returns items in the given column, sorted by order", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const [a, b] = state.items;
    const withA = moveItem(state, a.id, "todo");
    const withBoth = moveItem(withA, b.id, "todo");

    expect(selectItemsByColumn(withBoth, "todo").map((item) => item.id)).toEqual([a.id, b.id]);
  });

  it("excludes items not on the board and items in other columns", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const withA = moveItem(state, state.items[0].id, "todo");

    expect(selectItemsByColumn(withA, "todo")).toHaveLength(1);
  });
});

describe("selectColumns", () => {
  it("returns no columns when nothing is on a board", () => {
    expect(selectColumns(createInitialState())).toEqual([]);
  });

  it("returns each distinct column once, in first-seen order", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const [a, b] = state.items;
    const withA = moveItem(state, a.id, "done");
    const withBoth = moveItem(withA, b.id, "todo");

    expect(selectColumns(withBoth)).toEqual(["done", "todo"]);
  });

  it("does not repeat a column when more than one item shares it", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const [a, b] = state.items;
    const withA = moveItem(state, a.id, "todo");
    const withBoth = moveItem(withA, b.id, "todo");

    expect(selectColumns(withBoth)).toEqual(["todo"]);
  });
});
