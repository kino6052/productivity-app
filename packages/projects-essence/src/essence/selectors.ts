import type { TItem, TState } from "@productivity-app/core/src/essence/state";

export const selectProjects = (state: TState): TItem[] => state.items.filter((item) => item.project !== undefined);

export const selectItemsInProject = (state: TState, projectId: string): TItem[] =>
  state.items.filter((item) => item.projectId === projectId);
