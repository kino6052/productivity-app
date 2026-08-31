// TState carries real Date instances (TItem.createdAt, TCalendarFacet's
// start/end) -- a plain JSON.stringify/parse round-trip would hand those
// back as strings, silently breaking anything that calls a Date method on
// them (calendar-essence's selectItemsOnDay, for one). Tagging Date values
// on the way out and reviving them on the way in keeps any T's real shape
// intact, without persistence-local-storage.ts or a future
// persistence-firebase.ts needing to know which fields are dates.
const DATE_TAG = "__Date__" as const;

type TTaggedDate = { [DATE_TAG]: string };

const isTaggedDate = (value: unknown): value is TTaggedDate =>
  typeof value === "object" && value !== null && DATE_TAG in value;

export const encode = (value: unknown): string =>
  // A regular function, not an arrow: JSON.stringify binds `this` to the
  // object holding this key, so `this[key]` is the *raw* value -- unlike
  // the `val` parameter, which JSON.stringify already ran through
  // Date.prototype.toJSON (into an ISO string) before the replacer ever
  // sees it, so `val instanceof Date` would never be true.
  JSON.stringify(value, function (key, val) {
    return this[key] instanceof Date ? { [DATE_TAG]: (this[key] as Date).toISOString() } : val;
  });

export const decode = <T>(raw: string): T =>
  JSON.parse(raw, (_key, val) => (isTaggedDate(val) ? new Date(val[DATE_TAG]) : val)) as T;
