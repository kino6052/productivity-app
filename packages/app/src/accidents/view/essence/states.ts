// A curated list of essential scenarios to preview, bare-bone-storybook
// style -- not essence itself, a fixture set for manually verifying the
// essence-view against each shape the real state can take. Same convention
// as conduit's states.ts.
import { addItem } from "@productivity-app/core/src/essence/item";
import { createInitialPomodoroState, TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { completeSession } from "@productivity-app/pomodoro-essence/src/essence/complete-session";

export type TNamedState = {
  name: string;
  state: TPomodoroState;
};

const withOneItem = addItem(createInitialPomodoroState(), "Write report");
const itemId = withOneItem.items[0].id;

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
];
