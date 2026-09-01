// Serializes async writes for a single-document, whole-state-replacement
// store (persistence-firebase.ts's own shape: every save() sends the
// entire current state, not a delta) -- as its own accident, generic
// over the actual write function, so the ordering guarantee itself is
// testable without real network IO.
//
// The race this exists for: two state-changing view-model actions fired
// close together (e.g. Start immediately followed by Mark done) each
// call save(), and neither call is awaited by its caller (view-model
// actions are synchronous). Firing two independent network writes with
// no ordering guarantee between them means whichever happens to
// complete *last* wins on the server -- not necessarily the one that was
// logically the more recent action. A naive fix would queue every write
// and send them all in order, but since each write fully replaces the
// document, that's wasted network traffic for no benefit: only the
// *latest* value enqueued while a write is in flight actually needs to
// reach the server, so this coalesces down to it instead of sending
// every intermediate one.
export type TWriteQueue<T> = {
  enqueue: (value: T) => void;
};

export function createWriteQueue<T>(
  write: (value: T) => Promise<void>,
  onError: (error: unknown, value: T) => void = () => {},
): TWriteQueue<T> {
  let inFlight = false;
  let pending: { value: T } | undefined;

  const flush = () => {
    if (pending === undefined) return;
    const { value } = pending;
    pending = undefined;
    inFlight = true;
    write(value)
      .catch((error: unknown) => onError(error, value))
      .finally(() => {
        inFlight = false;
        flush();
      });
  };

  return {
    enqueue: (value: T) => {
      pending = { value };
      if (!inFlight) flush();
    },
  };
}
