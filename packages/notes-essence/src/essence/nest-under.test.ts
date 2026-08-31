import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { addNote } from "./add-note";
import { nestUnder } from "./nest-under";

describe("nestUnder", () => {
  it("nests a fresh item under a parent, creating an empty-body note facet", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Page one");
    const [notebook, page] = state.items;

    const next = nestUnder(state, page.id, notebook.id);

    expect(next.items[1].note).toEqual({ body: "", parentId: notebook.id });
  });

  it("preserves an existing note body when nesting", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Page one");
    const [notebook, page] = state.items;
    const withBody = addNote(state, page.id, "Some content");

    const next = nestUnder(withBody, page.id, notebook.id);

    expect(next.items[1].note).toEqual({ body: "Some content", parentId: notebook.id });
  });

  it("rejects nesting an item under itself", () => {
    const state = addItem(createInitialState(), "Page");
    const itemId = state.items[0].id;

    const next = nestUnder(state, itemId, itemId);

    expect(next).toEqual(state);
  });

  it("rejects creating a cycle", () => {
    const state = addItem(addItem(createInitialState(), "A"), "B");
    const [a, b] = state.items;
    const withANestedUnderB = nestUnder(state, a.id, b.id);

    const next = nestUnder(withANestedUnderB, b.id, a.id);

    expect(next).toEqual(withANestedUnderB);
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Notebook");

    const next = nestUnder(state, "missing", state.items[0].id);

    expect(next.items).toEqual(state.items);
  });
});
