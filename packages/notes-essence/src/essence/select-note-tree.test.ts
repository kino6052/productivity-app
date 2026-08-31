import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { nestUnder } from "./nest-under";
import { selectNoteTree } from "./select-note-tree";

describe("selectNoteTree", () => {
  it("builds the full nested tree from a root", () => {
    const state = addItem(
      addItem(addItem(createInitialState(), "Notebook"), "Section"),
      "Page",
    );
    const [notebook, section, page] = state.items;
    const withSection = nestUnder(state, section.id, notebook.id);
    const withPage = nestUnder(withSection, page.id, section.id);

    const tree = selectNoteTree(withPage, notebook.id);

    expect(tree).toEqual({
      item: withPage.items[0],
      children: [
        {
          item: withPage.items[1],
          children: [{ item: withPage.items[2], children: [] }],
        },
      ],
    });
  });

  it("returns undefined when the root id doesn't exist", () => {
    const state = createInitialState();

    expect(selectNoteTree(state, "missing")).toBeUndefined();
  });
});
