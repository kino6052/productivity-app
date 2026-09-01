import type { TState } from "@productivity-app/core/src/essence/state";
import { renameItem } from "@productivity-app/core/src/essence/rename-item";
import { removeItem } from "@productivity-app/core/src/essence/remove-item";
import { createProject } from "@productivity-app/projects-essence/src/essence/create-project";
import { selectProjects } from "@productivity-app/projects-essence/src/essence/selectors";

export type TGetState<S extends TState> = () => S;
export type TSetState<S extends TState> = (next: S) => void;

export const onRenameItem = <S extends TState>(
  itemId: string,
  title: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(renameItem(getState(), itemId, title));
};

// Does not cascade: a deleted project's member items keep their
// projectId pointing at a now-nonexistent project, so they become
// unreachable (no project left to select them under) rather than
// deleted themselves or reassigned. Same narrow, known edge case as
// notes-view-model.ts's onDeleteItem.
export const onDeleteItem = <S extends TState>(
  itemId: string,
  getState: TGetState<S>,
  setState: TSetState<S>,
): void => {
  setState(removeItem(getState(), itemId));
};

export type TProjectSummaryViewModel = {
  id: string;
  title: string;
  onRenameClick: (title: string) => void;
  onDeleteClick: () => void;
};

export type TProjectSelectorViewModel = {
  projects: TProjectSummaryViewModel[];
  onCreateProject: (title: string) => void;
};

export const compileProjectSelectorViewModel = <S extends TState>(
  state: S,
  getState: TGetState<S>,
  setState: TSetState<S>,
): TProjectSelectorViewModel => ({
  projects: selectProjects(state).map((item) => ({
    id: item.id,
    title: item.title,
    onRenameClick: (title) => onRenameItem(item.id, title, getState, setState),
    onDeleteClick: () => onDeleteItem(item.id, getState, setState),
  })),
  onCreateProject: (title) => setState(createProject(getState(), title)),
});
