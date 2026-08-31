// The real implementation of TPersistence (persistence.ts): window/browser
// localStorage. Not unit-tested -- a browser global, same category as
// conduit's navigation-hash.ts. Date round-tripping is handled by
// json-codec.ts (tested separately) so this file stays a thin wrapper
// around the one thing that actually can't run under bun:test.
import type { TPersistence } from "./persistence";
import { decode, encode } from "./json-codec";

export function createLocalStoragePersistence<T>(key: string): TPersistence<T> {
  return {
    load: () => {
      const raw = localStorage.getItem(key);
      return raw === null ? undefined : decode<T>(raw);
    },
    save: (value) => {
      localStorage.setItem(key, encode(value));
    },
    clear: () => {
      localStorage.removeItem(key);
    },
  };
}
