import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createProject } from "./create-project";
import { assignToProject } from "./assign-to-project";

describe("assignToProject", () => {
  it("sets the item's projectId", () => {
    const withProject = createProject(createInitialState(), "Website redesign");
    const projectId = withProject.items[0].id;
    const withTask = addItem(withProject, "Design homepage");
    const taskId = withTask.items[1].id;

    const next = assignToProject(withTask, taskId, projectId);

    expect(next.items[1].projectId).toBe(projectId);
  });

  it("leaves other items untouched", () => {
    const withProject = createProject(createInitialState(), "Website redesign");
    const projectId = withProject.items[0].id;
    const withTasks = addItem(addItem(withProject, "a"), "b");

    const next = assignToProject(withTasks, withTasks.items[1].id, projectId);

    expect(next.items[2].projectId).toBeUndefined();
  });

  it("is a no-op when no item has that id", () => {
    const state = addItem(createInitialState(), "a");

    const next = assignToProject(state, "missing", "some-project");

    expect(next.items).toEqual(state.items);
  });
});
