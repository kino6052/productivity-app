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
};

export type TState = {
  items: TItem[];
};

export const createInitialState = (): TState => ({ items: [] });
