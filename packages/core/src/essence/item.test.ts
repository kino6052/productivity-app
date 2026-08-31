import { describe, expect, it } from "bun:test";
import { createInitialState } from "./state";
import { addItem } from "./item";

describe("addItem", () => {
  it("adds a new item with the given title", () => {
    const state = createInitialState();

    const next = addItem(state, "Buy milk");

    expect(next.items).toHaveLength(1);
    expect(next.items[0].title).toBe("Buy milk");
    expect(typeof next.items[0].id).toBe("string");
    expect(next.items[0].id.length).toBeGreaterThan(0);
    expect(next.items[0].createdAt).toBeInstanceOf(Date);
  });

  it("does not mutate the original state", () => {
    const state = createInitialState();

    addItem(state, "Buy milk");

    expect(state.items).toHaveLength(0);
  });

  it("assigns each item a distinct id", () => {
    const state = createInitialState();

    const withFirst = addItem(state, "Buy milk");
    const withBoth = addItem(withFirst, "Buy milk");

    expect(withBoth.items[0].id).not.toBe(withBoth.items[1].id);
  });
});
