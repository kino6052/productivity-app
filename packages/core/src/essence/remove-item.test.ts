import { describe, expect, it } from "bun:test";
import { createInitialState } from "./state";
import { addItem } from "./item";
import { removeItem } from "./remove-item";

describe("removeItem", () => {
  it("removes the item with the given id", () => {
    const state = addItem(createInitialState(), "Buy milk");
    const id = state.items[0].id;

    const next = removeItem(state, id);

    expect(next.items).toHaveLength(0);
  });

  it("leaves other items untouched", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const id = state.items[0].id;

    const next = removeItem(state, id);

    expect(next.items).toEqual([state.items[1]]);
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Buy milk");

    const next = removeItem(state, "missing");

    expect(next.items).toEqual(state.items);
  });
});
