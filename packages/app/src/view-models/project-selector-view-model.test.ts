import { describe, expect, it } from "bun:test";
import { createInitialState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { createProject } from "@productivity-app/projects-essence/src/essence/create-project";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
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

  // Same real bug as kanban-view-model.test.ts's own case: any view's
  // onDeleteItem can orphan an active pomodoro session if it doesn't
  // clear it -- a project is itself just an item, so it can carry one too.
  it("also clears an active pomodoro session if the deleted project was running it", () => {
    const state = createProject(createInitialPomodoroState(), "Website redesign");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);
    const memory = createMemoryState(running);
    const vm = compileProjectSelectorViewModel(running, memory.getState, memory.setState);

    vm.projects[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
    expect(memory.getState().activeSession).toBeNull();
  });
});
