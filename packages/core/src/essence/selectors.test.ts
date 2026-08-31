import { describe, expect, it } from "bun:test";
import { createInitialState } from "./state";
import { addItem } from "./item";
import { selectAllItems, selectItem } from "./selectors";

describe("selectAllItems", () => {
  it("returns every item in state", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");

    expect(selectAllItems(state)).toEqual(state.items);
  });
});

describe("selectItem", () => {
  it("returns the item with the given id", () => {
    const state = addItem(createInitialState(), "Buy milk");
    const id = state.items[0].id;

    expect(selectItem(state, id)).toEqual(state.items[0]);
  });

  it("returns undefined when no item has that id", () => {
    const state = createInitialState();

    expect(selectItem(state, "missing")).toBeUndefined();
  });
});
