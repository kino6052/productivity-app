export type TPomodoroFacet = {
  estimatedCount: number;
  completedCount: number;
};

// Optional facets, one per mini app -- an item only picks up the facets it
// needs, and any mini app's essence only ever reads/writes its own facet.
// This is what makes one item usable across every app (docs/conventions.md).
export type TItem = {
  id: string;
  title: string;
  createdAt: Date;
  pomodoro?: TPomodoroFacet;
};

export type TState = {
  items: TItem[];
};

export const createInitialState = (): TState => ({ items: [] });
