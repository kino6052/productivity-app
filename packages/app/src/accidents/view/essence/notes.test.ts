import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { addNote } from "@productivity-app/notes-essence/src/essence/add-note";
import { nestUnder } from "@productivity-app/notes-essence/src/essence/nest-under";
import { renderNotes } from "./notes";

describe("renderNotes", () => {
  it("shows a root note's title", () => {
    const state = addItem(createInitialState(), "Notebook");
    const withNote = addNote(state, state.items[0].id, "");

    const html = renderNotes(withNote);

    expect(html).toContain("Notebook");
  });

  it("shows an add-child button for a root note", () => {
    const state = addItem(createInitialState(), "Notebook");
    const withNote = addNote(state, state.items[0].id, "");
    const itemId = state.items[0].id;

    const html = renderNotes(withNote);

    expect(html).toContain(`data-action="add-child" data-parent-id="${itemId}"`);
  });

  it("nests a child inside its parent's own list item", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Page");
    const [notebook, page] = state.items;
    const withNotebook = addNote(state, notebook.id, "");
    const nested = nestUnder(withNotebook, page.id, notebook.id);

    const html = renderNotes(nested);
    const notebookLi = html.slice(
      html.indexOf(`data-item-id="${notebook.id}"`),
      html.lastIndexOf("</li>") + "</li>".length,
    );

    expect(notebookLi).toContain(`data-item-id="${page.id}"`);
  });

  it("does not show an item with no note facet as a root", () => {
    const state = addItem(createInitialState(), "Not a note");

    const html = renderNotes(state);

    expect(html).not.toContain("Not a note");
  });
});
