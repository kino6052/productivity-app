import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { moveItem } from "./move-item";
import { reorderItem } from "./reorder-item";

const boardWithThreeInTodo = () => {
  const state = addItem(addItem(addItem(createInitialState(), "a"), "b"), "c");
  const [a, b, c] = state.items;
  const withA = moveItem(state, a.id, "todo");
  const withAB = moveItem(withA, b.id, "todo");
  const withABC = moveItem(withAB, c.id, "todo");
  return { state: withABC, a, b, c };
};

describe("reorderItem", () => {
  it("moves the item to the given index within its column", () => {
    const { state, a, b, c } = boardWithThreeInTodo();

    const next = reorderItem(state, c.id, 0);

    const order = next.items
      .slice()
      .sort((x, y) => x.kanban!.order - y.kanban!.order)
      .map((item) => item.id);
    expect(order).toEqual([c.id, a.id, b.id]);
  });

  it("renumbers orders sequentially from zero after reordering", () => {
    const { state, c } = boardWithThreeInTodo();

    const next = reorderItem(state, c.id, 0);

    const orders = next.items.map((item) => item.kanban!.order).sort();
    expect(orders).toEqual([0, 1, 2]);
  });

  it("leaves items in other columns untouched", () => {
    const state = addItem(createInitialState(), "elsewhere");
    const withElsewhere = moveItem(state, state.items[0].id, "done");
    const { state: board, c } = boardWithThreeInTodo();
    const combined = { ...board, items: [...board.items, withElsewhere.items[0]] };

    const next = reorderItem(combined, c.id, 0);

    expect(next.items.find((item) => item.id === withElsewhere.items[0].id)?.kanban).toEqual({
      column: "done",
      order: 0,
    });
  });

  it("is a no-op when the item has no kanban facet", () => {
    const state = addItem(createInitialState(), "not on a board");

    const next = reorderItem(state, state.items[0].id, 0);

    expect(next.items).toEqual(state.items);
  });
});
