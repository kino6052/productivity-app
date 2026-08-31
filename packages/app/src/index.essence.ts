// THE COMPOSITION ROOT for the essence view -- same rule as conduit's
// index.essence.ts: this is where essence and the essence-view render
// functions actually meet and get wired together, so it lives at the top
// of src/, not buried inside accidents/view/essence. The essence-view
// render functions themselves stay in accidents/view/essence -- they're
// the reusable, tested part; this file is the wiring. Not unit-tested
// (real DOM), verified live via the Browser tool instead -- same
// precedent as conduit's own composition roots.
//
// All four mini-app views read the *same* state object -- that's the
// direct, clickable proof of the shared-entity architecture: an item
// created in one view is immediately visible, with all its facets, in
// every other view, with zero glue code beyond picking which render
// function to call.
import { addItem } from "@productivity-app/core/src/essence/item";
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession, resumeSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { unscheduleItem } from "@productivity-app/calendar-essence/src/essence/unschedule-item";
import { nestUnder } from "@productivity-app/notes-essence/src/essence/nest-under";
import { renderPomodoro } from "./accidents/view/essence/pomodoro";
import { renderKanban } from "./accidents/view/essence/kanban";
import { renderCalendar } from "./accidents/view/essence/calendar";
import { renderNotes } from "./accidents/view/essence/notes";
import { renderSidebar } from "./accidents/view/essence/sidebar";
import { namedStates } from "./accidents/view/essence/states";
import { REFERENCE_DAY } from "./accidents/view/essence/reference-day";

type TViewName = "pomodoro" | "kanban" | "calendar" | "notes";
const VIEWS: TViewName[] = ["pomodoro", "kanban", "calendar", "notes"];

let activeStateName = namedStates[0].name;
let state: TPomodoroState = namedStates[0].state;
let activeView: TViewName = "pomodoro";

const renderView = (): string => {
  if (activeView === "pomodoro") return renderPomodoro(state);
  if (activeView === "kanban") return renderKanban(state);
  if (activeView === "calendar") return renderCalendar(state, REFERENCE_DAY);
  return renderNotes(state);
};

const renderViewNav = (): string =>
  `<nav>${VIEWS.map(
    (view) =>
      `<button data-action="select-view" data-view-name="${view}"${
        view === activeView ? ` aria-current="true"` : ""
      }>${view}</button>`,
  ).join("")}</nav>`;

export function render(): void {
  const sidebar = document.getElementById("sidebar");
  const nav = document.getElementById("nav");
  const app = document.getElementById("app");

  if (sidebar) {
    sidebar.innerHTML = renderSidebar(
      namedStates.map((named) => named.name),
      activeStateName,
    );
  }
  if (nav) nav.innerHTML = renderViewNav();
  if (app) app.innerHTML = renderView();
}

export function handleClick(event: Event): void {
  if (!(event.target instanceof Element)) return;
  const actionEl = event.target.closest<HTMLElement>("[data-action]");
  if (!actionEl) return;

  const { action, stateName, viewName, itemId, column, parentId } = actionEl.dataset;

  if (action === "select-state" && stateName) {
    const named = namedStates.find((candidate) => candidate.name === stateName);
    if (!named) return;
    activeStateName = named.name;
    state = named.state;
  } else if (action === "select-view" && viewName) {
    activeView = viewName as TViewName;
  } else if (action === "start-session" && itemId) {
    state = startSession(state, itemId);
  } else if (action === "pause-session") {
    state = pauseSession(state);
  } else if (action === "resume-session") {
    state = resumeSession(state);
  } else if (action === "move-item" && itemId && column) {
    state = moveItem(state, itemId, column);
  } else if (action === "schedule-item" && itemId) {
    state = scheduleItem(state, itemId, REFERENCE_DAY, REFERENCE_DAY);
  } else if (action === "unschedule-item" && itemId) {
    state = unscheduleItem(state, itemId);
  } else if (action === "add-child" && parentId) {
    const withChild = addItem(state, "Untitled");
    const childId = withChild.items[withChild.items.length - 1].id;
    state = nestUnder(withChild, childId, parentId);
  } else {
    return;
  }

  render();
}
