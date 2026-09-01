import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { createProject } from "@productivity-app/projects-essence/src/essence/create-project";
import { compileProjectSelectorViewModel } from "./project-selector-view-model";

describe("compileProjectSelectorViewModel", () => {
  it("lists each project's id and title", () => {
    const state = createProject(createInitialState(), "Website redesign");
    const memory = createMemoryState(state);

    const vm = compileProjectSelectorViewModel(state, memory.getState, memory.setState);

    expect(vm.projects[0].id).toBe(state.items[0].id);
    expect(vm.projects[0].title).toBe("Website redesign");
  });

  it("excludes plain, non-project items", () => {
    const state = addItem(createInitialState(), "Just a task");
    const memory = createMemoryState(state);

    const vm = compileProjectSelectorViewModel(state, memory.getState, memory.setState);

    expect(vm.projects).toEqual([]);
  });

  it("onCreateProject actually creates a real project via setState", () => {
    const memory = createMemoryState(createInitialState());
    const vm = compileProjectSelectorViewModel(createInitialState(), memory.getState, memory.setState);

    vm.onCreateProject("New project");

    const after = memory.getState();
    expect(after.items).toHaveLength(1);
    expect(after.items[0].project).toEqual({});
  });

  it("onRenameClick renames the project via setState", () => {
    const state = createProject(createInitialState(), "Website redesign");
    const memory = createMemoryState(state);
    const vm = compileProjectSelectorViewModel(state, memory.getState, memory.setState);

    vm.projects[0].onRenameClick("Website relaunch");

    expect(memory.getState().items[0].title).toBe("Website relaunch");
  });

  it("onDeleteClick removes the project via setState", () => {
    const state = createProject(createInitialState(), "Website redesign");
    const memory = createMemoryState(state);
    const vm = compileProjectSelectorViewModel(state, memory.getState, memory.setState);

    vm.projects[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
  });
});
