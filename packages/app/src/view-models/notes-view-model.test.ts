import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { addNote } from "@productivity-app/notes-essence/src/essence/add-note";
import { nestUnder } from "@productivity-app/notes-essence/src/essence/nest-under";
import { compileNotesViewModel } from "./notes-view-model";

describe("compileNotesViewModel", () => {
  it("lists a root note's title", () => {
    const state = addItem(createInitialState(), "Notebook");
    const withNote = addNote(state, state.items[0].id, "");
    const memory = createMemoryState(withNote);

    const vm = compileNotesViewModel(withNote, memory.getState, memory.setState);

    expect(vm.roots).toHaveLength(1);
    expect(vm.roots[0].title).toBe("Notebook");
  });

  it("nests a child under its parent in the tree", () => {
    const state = addItem(addItem(createInitialState(), "Notebook"), "Page");
    const [notebook, page] = state.items;
    const withNotebook = addNote(state, notebook.id, "");
    const nested = nestUnder(withNotebook, page.id, notebook.id);
    const memory = createMemoryState(nested);

    const vm = compileNotesViewModel(nested, memory.getState, memory.setState);

    expect(vm.roots[0].children).toHaveLength(1);
    expect(vm.roots[0].children[0].title).toBe("Page");
  });

  it("onAddChildClick creates and nests a new item via setState", () => {
    const state = addItem(createInitialState(), "Notebook");
    const notebookId = state.items[0].id;
    const withNote = addNote(state, notebookId, "");
    const memory = createMemoryState(withNote);
    const vm = compileNotesViewModel(withNote, memory.getState, memory.setState);

    vm.roots[0].onAddChildClick();

    const after = memory.getState();
    expect(after.items).toHaveLength(2);
    expect(after.items[1].note?.parentId).toBe(notebookId);
  });

  it("onCreateRootNote creates a brand-new root note via setState", () => {
    const memory = createMemoryState(createInitialState());
    const vm = compileNotesViewModel(createInitialState(), memory.getState, memory.setState);

    vm.onCreateRootNote("My notebook");

    const after = memory.getState();
    expect(after.items).toHaveLength(1);
    expect(after.items[0].title).toBe("My notebook");
    expect(after.items[0].note).toEqual({ body: "", parentId: undefined });
  });
});
