// A curated list of essential scenarios to preview, bare-bone-storybook
// style -- not essence itself, a fixture set for manually verifying the
// essence-view against each shape the real state can take. Same convention
// as conduit's states.ts. TPomodoroState (TState + activeSession) is used
// throughout even for non-pomodoro states, since it's a strict superset of
// TState and every render function here only reads the facets it cares
// about (docs/conventions.md).
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState, TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { completeSession } from "@productivity-app/pomodoro-essence/src/essence/complete-session";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { scheduleItem } from "@productivity-app/calendar-essence/src/essence/schedule-item";
import { addNote } from "@productivity-app/notes-essence/src/essence/add-note";
import { nestUnder } from "@productivity-app/notes-essence/src/essence/nest-under";
import { REFERENCE_DAY } from "./reference-day";

export type TNamedState = {
  name: string;
  state: TPomodoroState;
};

const withOneItem = addItem(createInitialPomodoroState(), "Write report");
const itemId = withOneItem.items[0].id;

const withNotebook = addItem(createInitialPomodoroState(), "Project notebook");
const notebookId = withNotebook.items[0].id;
const withNotebookNote = addNote(withNotebook, notebookId, "");
const withPage = addItem(withNotebookNote, "Page one");
const pageId = withPage.items[withPage.items.length - 1].id;
const withNestedPage = nestUnder(withPage, pageId, notebookId);

// The direct, visible proof of "every entity usable in every app": one
// item picks up all four facets, so it shows up correctly in every view.
const withEverywhereItem = addItem(createInitialPomodoroState(), "Ship the release");
const everywhereId = withEverywhereItem.items[0].id;
const everywhereWithNote = addNote(withEverywhereItem, everywhereId, "Cross-app demo item.");
const everywhereWithKanban = moveItem(everywhereWithNote, everywhereId, "doing");
const everywhereWithCalendar = scheduleItem(
  everywhereWithKanban,
  everywhereId,
  REFERENCE_DAY,
  REFERENCE_DAY,
);

export const namedStates: TNamedState[] = [
  {
    name: "Empty",
    state: createInitialPomodoroState(),
  },
  {
    name: "One item, no session",
    state: withOneItem,
  },
  {
    name: "Running session",
    state: startSession(withOneItem, itemId),
  },
  {
    name: "Paused session",
    state: pauseSession(startSession(withOneItem, itemId)),
  },
  {
    name: "One pomodoro completed",
    state: completeSession(withOneItem, itemId),
  },
  {
    name: "Notebook with a nested page",
    state: withNestedPage,
  },
  {
    name: "One item, usable everywhere",
    state: everywhereWithCalendar,
  },
];
