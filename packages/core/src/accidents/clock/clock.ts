// A repeating background timer, as its own accident -- not tied to any
// view framework's component lifecycle. It used to be a raw setInterval
// inside App.tsx's onMount/onCleanup (the Solid delivery), which was the
// wrong layer: driving the pomodoro clock is background-process logic,
// not view logic, and every mini-app view is supposed to be swappable
// without touching it (same reasoning persistence/state-management
// already live outside any one view). Tying it to a Solid component's
// mount lifecycle also caused a real bug: Solid's dev HMR
// (vite-plugin-solid) can hot-swap a component without its previous
// instance's onCleanup ever running first, leaving the *old* interval
// running -- still closed over an *old* getState/setState pair -- and its
// stale writes would race the new instance's (e.g. a just-completed item
// silently reverting whenever the old interval's write landed after the
// new one's).
//
// setInterval/clearInterval are injected (defaulting to the real
// globals) purely so `onInterval`'s own stop-guard behavior -- the actual
// thing worth testing -- can be asserted deterministically without real
// wall-clock delays.
export type TClock = {
  // Runs `callback` every `intervalMs`. Returns a function that stops it
  // -- guaranteed to make `callback` a no-op from that point on, even if
  // the underlying timer somehow keeps firing (a leaked/stale interval).
  onInterval: (intervalMs: number, callback: () => void) => () => void;
};

export type TClockDeps = {
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;
};

// Bound to globalThis -- a browser's setInterval/clearInterval throw
// "Illegal invocation" if called detached from their original `this`
// (they're native DOM APIs, not plain functions), which a bare
// `{ setInterval, clearInterval }` destructure does. Caught live, not
// guessed: the real app threw this the instant the clock started.
const realDeps: TClockDeps = {
  setInterval: setInterval.bind(globalThis),
  clearInterval: clearInterval.bind(globalThis),
};

export function createClock(deps: TClockDeps = realDeps): TClock {
  return {
    onInterval: (intervalMs, callback) => {
      let stopped = false;
      const id = deps.setInterval(() => {
        if (!stopped) callback();
      }, intervalMs);
      return () => {
        stopped = true;
        deps.clearInterval(id);
      };
    },
  };
}
