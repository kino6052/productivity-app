import type { TState } from "@productivity-app/core/src/essence/state";
import { createProject } from "@productivity-app/projects-essence/src/essence/create-project";
import { selectProjects } from "@productivity-app/projects-essence/src/essence/selectors";

export type TGetState<S extends TState> = () => S;
export type TSetState<S extends TState> = (next: S) => void;

export type TProjectSummaryViewModel = {
  id: string;
  title: string;
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
  projects: selectProjects(state).map((item) => ({ id: item.id, title: item.title })),
  onCreateProject: (title) => setState(createProject(getState(), title)),
});
