export type TPomodoroFacet = {
  estimatedCount: number;
  completedCount: number;
};

export type TKanbanFacet = {
  column: string;
  order: number;
};

export type TCalendarFacet = {
  start: Date;
  end: Date;
};

// parentId nests one item under another -- a notebook > section > page tree
// is just items nesting items (docs/checklist.md, Part 5). No parentId means
// a root-level note.
export type TNoteFacet = {
  body: string;
  parentId: string | undefined;
};

// An empty marker: an item either is a project, or it isn't. Nothing else
// about "being a project" is stored here -- a project's own title/id are
// already TItem's, same minimalism as every other facet.
export type TProjectFacet = Record<string, never>;

// Optional facets, one per mini app -- an item only picks up the facets it
// needs, and any mini app's essence only ever reads/writes its own facet.
// This is what makes one item usable across every app (docs/conventions.md).
export type TItem = {
  id: string;
  title: string;
  createdAt: Date;
  pomodoro?: TPomodoroFacet;
  kanban?: TKanbanFacet;
  calendar?: TCalendarFacet;
  note?: TNoteFacet;
  project?: TProjectFacet;
  // Cross-cutting, not a facet: which project (if any) this item belongs
  // to. Orthogonal to the facets above -- any item, whatever facets it
  // carries, can belong to a project. No mini app's essence reads this;
  // only projects-essence and the composition root's scoping logic do.
  projectId?: string;
};

export type TState = {
  items: TItem[];
};

export const createInitialState = (): TState => ({ items: [] });
