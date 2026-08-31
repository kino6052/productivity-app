import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { nestUnder } from "./nest-under";
import { moveOutOfParent } from "./move-out-of-parent";

describe("moveOutOfParent", () => {
  it("clears the item's parentId", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Page");
    const [notebook, page] = state.items;
    const nested = nestUnder(state, page.id, notebook.id);

    const next = moveOutOfParent(nested, page.id);

    expect(next.items[1].note).toEqual({ body: "", parentId: undefined });
  });

  it("is a no-op when the item has no note facet", () => {
    const state = addItem(createInitialState(), "Not a note");

    const next = moveOutOfParent(state, state.items[0].id);

    expect(next.items).toEqual(state.items);
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Notebook");

    const next = moveOutOfParent(state, "missing");

    expect(next.items).toEqual(state.items);
  });
});
