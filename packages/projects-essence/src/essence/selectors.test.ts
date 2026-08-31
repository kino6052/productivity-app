import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createProject } from "./create-project";
import { assignToProject } from "./assign-to-project";
import { selectItemsInProject, selectProjects } from "./selectors";

describe("selectProjects", () => {
  it("returns only items carrying the project facet", () => {
    const state = addItem(createProject(createInitialState(), "Website redesign"), "Not a project");

    expect(selectProjects(state).map((p) => p.title)).toEqual(["Website redesign"]);
  });

  it("returns an empty list when there are no projects", () => {
    const state = addItem(createInitialState(), "Just a task");

    expect(selectProjects(state)).toEqual([]);
  });
});

describe("selectItemsInProject", () => {
  it("returns items assigned to the given project", () => {
    const withProject = createProject(createInitialState(), "Website redesign");
    const projectId = withProject.items[0].id;
    const withTask = addItem(withProject, "Design homepage");
    const withAssigned = assignToProject(withTask, withTask.items[1].id, projectId);

    expect(selectItemsInProject(withAssigned, projectId).map((i) => i.title)).toEqual([
      "Design homepage",
    ]);
  });

  it("excludes items assigned to a different project", () => {
    const withProject = createProject(createInitialState(), "Website redesign");
    const projectId = withProject.items[0].id;

    expect(selectItemsInProject(withProject, projectId)).toEqual([]);
  });
});
