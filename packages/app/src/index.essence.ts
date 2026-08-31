// THE COMPOSITION ROOT for the essence view -- same rule as conduit's
// index.essence.ts: this is where essence and the essence-view render
// functions actually meet and get wired together, so it lives at the top
// of src/, not buried inside accidents/view/essence. The essence-view
// render functions themselves (pomodoro.ts, sidebar.ts, states.ts) stay in
// accidents/view/essence -- they're the reusable, tested part; this file is
// the wiring. Not unit-tested (real DOM), verified live via the Browser
// tool instead -- same precedent as conduit's own composition roots.
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession, resumeSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { renderPomodoro } from "./accidents/view/essence/pomodoro";
import { renderSidebar } from "./accidents/view/essence/sidebar";
import { namedStates } from "./accidents/view/essence/states";

let activeStateName = namedStates[0].name;
let state: TPomodoroState = namedStates[0].state;

export function render(): void {
  const sidebar = document.getElementById("sidebar");
  const app = document.getElementById("app");

  if (sidebar) {
    sidebar.innerHTML = renderSidebar(
      namedStates.map((named) => named.name),
      activeStateName,
    );
  }
  if (app) app.innerHTML = renderPomodoro(state);
}

export function handleClick(event: Event): void {
  if (!(event.target instanceof Element)) return;
  const actionEl = event.target.closest<HTMLElement>("[data-action]");
  if (!actionEl) return;

  const { action, stateName, itemId } = actionEl.dataset;

  if (action === "select-state" && stateName) {
    const named = namedStates.find((candidate) => candidate.name === stateName);
    if (!named) return;
    activeStateName = named.name;
    state = named.state;
  } else if (action === "start-session" && itemId) {
    state = startSession(state, itemId);
  } else if (action === "pause-session") {
    state = pauseSession(state);
  } else if (action === "resume-session") {
    state = resumeSession(state);
  } else {
    return;
  }

  render();
}
