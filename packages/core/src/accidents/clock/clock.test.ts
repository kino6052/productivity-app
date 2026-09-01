import { describe, expect, it } from "bun:test";
import { createClock } from "./clock";

// Fakes setInterval/clearInterval entirely -- this lets the "stopped"
// guard behavior (the actual thing worth testing) be asserted directly
// and deterministically, without real wall-clock delays or any framework
// timer-mocking utility.
function createFakeTimers() {
  const calls: Array<{ id: number; fn: () => void }> = [];
  const cleared: number[] = [];
  let nextId = 1;

  const fakeSetInterval = ((fn: () => void) => {
    const id = nextId++;
    calls.push({ id, fn });
    return id as unknown as ReturnType<typeof setInterval>;
  }) as typeof setInterval;

  const fakeClearInterval = ((id: unknown) => {
    cleared.push(id as number);
  }) as typeof clearInterval;

  return {
    fakeSetInterval,
    fakeClearInterval,
    cleared,
    // Simulates the underlying timer firing, independent of whether
    // clearInterval was actually called on it -- the real-world case a
    // leaked/stale interval represents.
    fire: (id: number) => calls.find((c) => c.id === id)?.fn(),
  };
}

describe("createClock", () => {
  // Exercises the default-parameter path (real global setInterval/
  // clearInterval, not the fakes every other test here injects) -- a
  // long delay and an immediate stop() means the real timer is
  // guaranteed to be cleared before it could ever fire, so this stays
  // fast and deterministic without needing to fake the globals.
  it("defaults to the real global setInterval/clearInterval when no deps are given", () => {
    const clock = createClock();

    const stop = clock.onInterval(60_000, () => {});

    expect(typeof stop).toBe("function");
    expect(() => stop()).not.toThrow();
  });

  it("starts a real interval at the given delay", () => {
    const timers = createFakeTimers();
    const clock = createClock({ setInterval: timers.fakeSetInterval, clearInterval: timers.fakeClearInterval });
    let ticks = 0;

    clock.onInterval(1000, () => {
      ticks += 1;
    });
    timers.fire(1);

    expect(ticks).toBe(1);
  });

  it("invokes the callback on every fire while running", () => {
    const timers = createFakeTimers();
    const clock = createClock({ setInterval: timers.fakeSetInterval, clearInterval: timers.fakeClearInterval });
    let ticks = 0;

    clock.onInterval(1000, () => {
      ticks += 1;
    });
    timers.fire(1);
    timers.fire(1);
    timers.fire(1);

    expect(ticks).toBe(3);
  });

  it("calls the injected clearInterval when stopped", () => {
    const timers = createFakeTimers();
    const clock = createClock({ setInterval: timers.fakeSetInterval, clearInterval: timers.fakeClearInterval });

    const stop = clock.onInterval(1000, () => {});
    stop();

    expect(timers.cleared).toEqual([1]);
  });

  // The actual race condition this exists for: a leaked/stale interval
  // (e.g. from a hot-swapped view instance whose disposal didn't run
  // before a new one started) keeps calling the underlying timer's
  // callback even after stop() was called. The guard must make that a
  // no-op regardless of whether the real clearInterval actually took
  // effect.
  it("stops invoking the callback after stop(), even if the underlying timer keeps firing anyway", () => {
    const timers = createFakeTimers();
    const clock = createClock({ setInterval: timers.fakeSetInterval, clearInterval: timers.fakeClearInterval });
    let ticks = 0;

    const stop = clock.onInterval(1000, () => {
      ticks += 1;
    });
    timers.fire(1);
    stop();
    timers.fire(1); // simulates the leaked/stale interval still firing

    expect(ticks).toBe(1);
  });

  it("keeps two independent intervals from interfering with each other", () => {
    const timers = createFakeTimers();
    const clock = createClock({ setInterval: timers.fakeSetInterval, clearInterval: timers.fakeClearInterval });
    let a = 0;
    let b = 0;

    const stopA = clock.onInterval(1000, () => {
      a += 1;
    });
    clock.onInterval(500, () => {
      b += 1;
    });

    stopA();
    timers.fire(1); // A's underlying timer, now stopped -- must not tick a
    timers.fire(2); // B's own timer -- untouched by stopping A

    expect(a).toBe(0);
    expect(b).toBe(1);
  });
});
