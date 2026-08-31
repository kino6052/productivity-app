import { describe, expect, it } from "bun:test";
import { createInitialState } from "./state";
import { addItem } from "./item";
import { renameItem } from "./rename-item";

describe("renameItem", () => {
  it("renames the item with the given id", () => {
    const state = addItem(createInitialState(), "Buy milk");
    const id = state.items[0].id;

    const next = renameItem(state, id, "Buy oat milk");

    expect(next.items[0].title).toBe("Buy oat milk");
  });

  it("leaves other items untouched", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const id = state.items[0].id;

    const next = renameItem(state, id, "renamed");

    expect(next.items[1]).toEqual(state.items[1]);
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Buy milk");

    const next = renameItem(state, "missing", "renamed");

    expect(next.items).toEqual(state.items);
  });
});
