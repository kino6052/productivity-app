export type TItem = {
  id: string;
  title: string;
  createdAt: Date;
};

export type TState = {
  items: TItem[];
};

export const createInitialState = (): TState => ({ items: [] });
