import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { addNote } from "./add-note";

describe("addNote", () => {
  it("gives the item a note facet with the given body", () => {
    const state = addItem(createInitialState(), "Meeting notes");

    const next = addNote(state, state.items[0].id, "Discussed roadmap.");

    expect(next.items[0].note).toEqual({ body: "Discussed roadmap.", parentId: undefined });
  });

  it("updates the body while preserving an existing parent", () => {
    const state = addItem(createInitialState(), "Meeting notes");
    const withParent = {
      ...state,
      items: [{ ...state.items[0], note: { body: "draft", parentId: "notebook-1" } }],
    };

    const next = addNote(withParent, state.items[0].id, "final text");

    expect(next.items[0].note).toEqual({ body: "final text", parentId: "notebook-1" });
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "Meeting notes");

    const next = addNote(state, "missing", "text");

    expect(next.items).toEqual(state.items);
  });
});
