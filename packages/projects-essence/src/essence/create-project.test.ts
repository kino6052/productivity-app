import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { createProject } from "./create-project";

describe("createProject", () => {
  it("creates an item with the given title, marked as a project", () => {
    const state = createProject(createInitialState(), "Website redesign");

    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe("Website redesign");
    expect(state.items[0].project).toEqual({});
  });

  it("gives each project a distinct id", () => {
    const withFirst = createProject(createInitialState(), "A");
    const withBoth = createProject(withFirst, "B");

    expect(withBoth.items[0].id).not.toBe(withBoth.items[1].id);
  });
});
