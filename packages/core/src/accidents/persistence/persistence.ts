// A generic contract, not "storage" baked into any one accident — same ISP
// discipline as conduit's TStateManagement<T>. Doesn't know what T is, so it
// can back an in-memory Item list today without becoming "the persistence
// layer for everything" tomorrow just because it happens to be generic.
export type TPersistence<T> = {
  load: () => T | undefined;
  save: (value: T) => void;
  clear: () => void;
};

// The simplest implementation — good enough to test the contract itself and
// to let anything built on top of TPersistence be tested without a real
// browser/Firebase. Real implementations (localStorage, Firebase) live in
// their own sibling files so this file's branches stay covered without
// needing a coverage exclude for real IO.
export function createMemoryPersistence<T>(): TPersistence<T> {
  let value: T | undefined;

  return {
    load: () => value,
    save: (next) => {
      value = next;
    },
    clear: () => {
      value = undefined;
    },
  };
}
