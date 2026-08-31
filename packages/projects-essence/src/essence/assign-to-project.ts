import type { TState } from "@productivity-app/core/src/essence/state";

export const assignToProject = <S extends TState>(state: S, itemId: string, projectId: string): S =>
  ({
    ...state,
    items: state.items.map((item) => (item.id === itemId ? { ...item, projectId } : item)),
  }) as S;
