import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { renderKanban } from "./kanban";

describe("renderKanban", () => {
  it("lists an unassigned item's title in the inbox", () => {
    const state = addItem(createInitialState(), "Write report");

    const html = renderKanban(state);

    expect(html).toContain("Write report");
  });

  it("shows a move-to-todo button for an unassigned item", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;

    const html = renderKanban(state);

    expect(html).toContain(`data-action="move-item" data-item-id="${itemId}" data-column="todo"`);
  });

  it("lists an item under its actual column once moved, sorted by order", () => {
    const state = addItem(addItem(createInitialState(), "a"), "b");
    const [a, b] = state.items;
    const withA = moveItem(state, a.id, "todo");
    const withBoth = moveItem(withA, b.id, "todo");

    const html = renderKanban(withBoth);
    const columnHtml = html.slice(html.indexOf('data-column-name="todo"'));

    expect(columnHtml.indexOf(a.id)).toBeLessThan(columnHtml.indexOf(b.id));
  });

  it("does not show a move-to-todo button for an item already in todo", () => {
    const state = addItem(createInitialState(), "Write report");
    const itemId = state.items[0].id;
    const onBoard = moveItem(state, itemId, "todo");

    const html = renderKanban(onBoard);

    expect(html).not.toContain(`data-action="move-item" data-item-id="${itemId}" data-column="todo"`);
    expect(html).toContain(`data-action="move-item" data-item-id="${itemId}" data-column="doing"`);
  });

  it("does not list an item in the inbox once it has a kanban facet", () => {
    const state = addItem(createInitialState(), "Write report");
    const onBoard = moveItem(state, state.items[0].id, "todo");

    const html = renderKanban(onBoard);
    const inboxHtml = html.slice(0, html.indexOf('data-column-name="todo"'));

    expect(inboxHtml).not.toContain("Write report");
  });
});
