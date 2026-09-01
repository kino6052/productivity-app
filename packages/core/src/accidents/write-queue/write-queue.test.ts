import { describe, expect, it } from "bun:test";
import { createWriteQueue } from "./write-queue";

// A controllable fake write: records every call, and lets the test
// resolve/reject each one on its own schedule instead of a real network
// delay -- what actually matters here (never two writes in flight at
// once, only the latest pending value survives a burst) only shows up
// when writes overlap in time, so the test needs to control that
// precisely.
function createControllableWrite<T>() {
  const calls: T[] = [];
  const resolvers: Array<() => void> = [];

  const write = (value: T): Promise<void> => {
    calls.push(value);
    return new Promise<void>((resolve) => {
      resolvers.push(resolve);
    });
  };

  return {
    write,
    calls,
    // Resolves the oldest still-pending call.
    resolveNext: async () => {
      resolvers.shift()?.();
      // Let the queue's own .then()/.finally() microtasks run.
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

describe("createWriteQueue", () => {
  it("calls write with the enqueued value", async () => {
    const fake = createControllableWrite<string>();
    const queue = createWriteQueue(fake.write);

    queue.enqueue("a");
    await Promise.resolve();

    expect(fake.calls).toEqual(["a"]);
  });

  // The actual race condition this exists for: two state-changing
  // actions fired close together (e.g. Start immediately followed by
  // Mark done) must never have two writes in flight at once -- since
  // there's no ordering guarantee on which network round trip completes
  // first, an earlier write landing *after* a later one would silently
  // revert the saved state to something stale.
  it("never starts a second write while one is still in flight", async () => {
    const fake = createControllableWrite<string>();
    const queue = createWriteQueue(fake.write);

    queue.enqueue("a");
    queue.enqueue("b");
    queue.enqueue("c");
    await Promise.resolve();

    // Only the first write has actually gone out -- b and c arrived
    // while it was still pending.
    expect(fake.calls).toEqual(["a"]);
  });

  it("sends only the latest value once the in-flight write finishes, not every intermediate one", async () => {
    const fake = createControllableWrite<string>();
    const queue = createWriteQueue(fake.write);

    queue.enqueue("a");
    queue.enqueue("b");
    queue.enqueue("c");
    await fake.resolveNext(); // "a" completes

    expect(fake.calls).toEqual(["a", "c"]); // "b" was superseded, never sent
  });

  it("coalesces a burst that arrives mid-write down to just its latest value, across multiple rounds", async () => {
    const fake = createControllableWrite<number>();
    const queue = createWriteQueue(fake.write);

    queue.enqueue(1); // nothing in flight -- sent immediately
    queue.enqueue(2); // arrives while 1 is in flight -- superseded by 3 below
    queue.enqueue(3); // arrives while 1 is still in flight -- the survivor
    await fake.resolveNext(); // 1 settles; only 3 goes out next (2 is skipped)
    queue.enqueue(4); // arrives while 3 is in flight -- the next survivor
    await fake.resolveNext(); // 3 settles; 4 goes out
    await fake.resolveNext(); // 4 settles; nothing left pending

    expect(fake.calls).toEqual([1, 3, 4]);
  });

  it("reports a failed write via onError, and keeps processing later enqueues", async () => {
    const errors: unknown[] = [];
    let shouldReject = true;
    const calls: number[] = [];
    const write = (value: number): Promise<void> => {
      calls.push(value);
      return shouldReject ? Promise.reject(new Error("boom")) : Promise.resolve();
    };
    const queue = createWriteQueue(write, (error) => errors.push(error));

    queue.enqueue(1);
    await Promise.resolve();
    await Promise.resolve();

    expect(errors).toHaveLength(1);

    shouldReject = false;
    queue.enqueue(2);
    await Promise.resolve();
    await Promise.resolve();

    expect(calls).toEqual([1, 2]);
    expect(errors).toHaveLength(1);
  });

  it("does nothing extra when enqueue is called only once with nothing in flight", async () => {
    const fake = createControllableWrite<string>();
    const queue = createWriteQueue(fake.write);

    queue.enqueue("only");
    await fake.resolveNext();

    expect(fake.calls).toEqual(["only"]);
  });
});
