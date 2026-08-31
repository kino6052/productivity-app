import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { addNote } from "./add-note";
import { nestUnder } from "./nest-under";
import { selectChildren, selectRootNotes } from "./selectors";

describe("selectChildren", () => {
  it("returns items nested directly under the given parent", () => {
    const state = addItem(addItem(addItem(createInitialState(), "Notebook"), "Page 1"), "Page 2");
    const [notebook, page1, page2] = state.items;
    const withPage1 = nestUnder(state, page1.id, notebook.id);
    const withBoth = nestUnder(withPage1, page2.id, notebook.id);

    expect(selectChildren(withBoth, notebook.id).map((item) => item.id)).toEqual([page1.id, page2.id]);
  });

  it("excludes items with no note facet", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Unrelated");

    expect(selectChildren(state, state.items[0].id)).toEqual([]);
  });
});

describe("selectRootNotes", () => {
  it("returns note-faceted items with no parent", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Page");
    const [notebook, page] = state.items;
    const withNotebook = addNote(state, notebook.id, "");
    const nested = nestUnder(withNotebook, page.id, notebook.id);

    expect(selectRootNotes(nested).map((item) => item.id)).toEqual([notebook.id]);
  });

  it("excludes items with no note facet", () => {
    const state = addItem(createInitialState(), "Not a note");

    expect(selectRootNotes(state)).toEqual([]);
  });
});
