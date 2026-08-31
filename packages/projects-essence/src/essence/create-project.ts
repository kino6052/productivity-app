import type { TState } from "@productivity-app/core/src/essence/state";
import { addItem } from "@productivity-app/core/src/essence/item";

export const createProject = <S extends TState>(state: S, title: string): S => {
  const withItem = addItem(state, title);
  const projectId = withItem.items[withItem.items.length - 1].id;

  return {
    ...withItem,
    items: withItem.items.map((item) => (item.id === projectId ? { ...item, project: {} } : item)),
  } as S;
};
