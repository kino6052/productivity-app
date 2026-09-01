// Conduit's view-model.ts pattern: pure functions that turn essence state
// into a typed, framework-agnostic object tree -- action closures already
// bound, so a real UI component (Solid, eventually) just reads props and
// calls callbacks, and a test can assert on the returned tree directly
// instead of string-matching rendered HTML (that's what
// accidents/view/essence/pomodoro.ts is for -- a separate, independent
// tier, same as conduit keeps its essence-view and its react view-model
// as two parallel representations of the same essence, neither depending
// on the other).
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { pauseSession, resumeSession } from "@productivity-app/pomodoro-essence/src/essence/pause-resume";
import { tick } from "@productivity-app/pomodoro-essence/src/essence/tick";
import { completeSession } from "@productivity-app/pomodoro-essence/src/essence/complete-session";
import { renameItem } from "@productivity-app/core/src/essence/rename-item";
import { removeItem } from "@productivity-app/core/src/essence/remove-item";
import { moveItem } from "@productivity-app/kanban-essence/src/essence/move-item";
import { clearOrphanedPomodoroSession } from "./clear-orphaned-pomodoro-session";
import { formatDuration } from "../accidents/view/essence/format-duration";

export type TGetState = () => TPomodoroState;
export type TSetState = (next: TPomodoroState) => void;

// Cross-app sync (requested): starting a pomodoro session is also the
// moment an item is "in progress" from a kanban point of view. This lives
// here, not in either essence -- pomodoro-essence and kanban-essence stay
// mutually unaware of each other (docs/checklist.md, Part 6); the
// view-model tier is where chaining across mini-app essences already
// happens (same idiom as onCreateProject chaining addItem +
// assignToProject). startSession is a documented no-op (returns the same
// reference) when a session is already running, so only move to "doing"
// when a session genuinely started.
export const onStartSession = (itemId: string, getState: TGetState, setState: TSetState): void => {
  const prev = getState();
  const next = startSession(prev, itemId);
  setState(next === prev ? next : moveItem(next, itemId, "doing"));
};

export const onPauseSession = (getState: TGetState, setState: TSetState): void => {
  setState(pauseSession(getState()));
};

export const onResumeSession = (getState: TGetState, setState: TSetState): void => {
  setState(resumeSession(getState()));
};

// The other half of the same sync: finishing a work phase (tick's
// work -> break transition, which is also what already drives
// completeSession's completedCount increment) moves the item to "done".
// Wraps tick() the same way App.tsx's interval already did (skip
// persisting when tick is a documented no-op, i.e. returns the same
// reference) -- that comparison now lives here instead, so the interval
// itself no longer needs to know about kanban at all.
export const onTick = (getState: TGetState, setState: TSetState): void => {
  const prev = getState();
  const next = tick(prev);
  if (next === prev) return;

  const justFinishedWork =
    prev.activeSession?.phase === "work" &&
    next.activeSession?.phase === "break" &&
    next.activeSession.itemId === prev.activeSession.itemId;

  setState(justFinishedWork ? moveItem(next, next.activeSession!.itemId, "done") : next);
};

// Requested: mark a pomodoro item as done directly, not only by letting
// its 25-minute work phase run out naturally. Reuses the exact same
// completeSession + move-to-"done" pairing onTick's own natural
// completion already does (the finished item's completedCount goes up
// either way), plus stops the timer if this item happens to be the one
// currently running -- marking something done while it's still
// "in progress" would otherwise leave a running session for an item that
// no longer needs one.
export const onMarkDone = (itemId: string, getState: TGetState, setState: TSetState): void => {
  const prev = getState();
  const withCompleted = completeSession(prev, itemId);
  const withSessionStopped: TPomodoroState =
    prev.activeSession?.itemId === itemId ? { ...withCompleted, activeSession: null } : withCompleted;
  setState(moveItem(withSessionStopped, itemId, "done"));
};

export const onRenameItem = (itemId: string, title: string, getState: TGetState, setState: TSetState): void => {
  setState(renameItem(getState(), itemId, title));
};

// Real bug, found live: removeItem (core) has no idea a pomodoro session
// exists at all -- activeSession lives on TPomodoroState, not on TItem --
// so deleting the item currently running a session left activeSession
// pointing at an id nothing could ever reach again (its own pause/resume
// controls only render for an item that still exists), permanently
// blocking every future startSession call. clearOrphanedPomodoroSession
// is shared by every mini-app view-model's own onDeleteItem, since Part
// 11's context menu lets any of them delete any item, not just this one;
// startSession's own orphan self-heal (pomodoro-essence) covers state
// that already got into this shape some other way (e.g. before this fix
// existed at all).
export const onDeleteItem = (itemId: string, getState: TGetState, setState: TSetState): void => {
  setState(clearOrphanedPomodoroSession(removeItem(getState(), itemId), itemId));
};

export type TPomodoroSessionViewModel = {
  phaseLabel: string;
  remainingLabel: string;
  // Presence, not a flag -- same rule as conduit's onDeleteClick: exactly
  // one of these two is ever defined, and which one is the only signal a
  // consumer needs.
  onPauseClick: (() => void) | undefined;
  onResumeClick: (() => void) | undefined;
};

export type TPomodoroItemViewModel = {
  id: string;
  title: string;
  completedLabel: string;
  // undefined when this item already has the running session -- presence
  // gates the control, same rule as above.
  onStartClick: (() => void) | undefined;
  session: TPomodoroSessionViewModel | undefined;
  // Always present, unlike the actions above -- renaming/deleting doesn't
  // depend on pomodoro state. Consumed by the context menu (right-click /
  // long-press), not shown as inline buttons.
  onRenameClick: (title: string) => void;
  onDeleteClick: () => void;
  // Also always present (requested) -- marking something done doesn't
  // depend on a session being active either; shown as an inline button,
  // not tucked into the context menu, since it's a primary action.
  onMarkDoneClick: () => void;
};

export type TPomodoroViewModel = {
  items: TPomodoroItemViewModel[];
};

const compileSessionViewModel = (
  session: NonNullable<TPomodoroState["activeSession"]>,
  getState: TGetState,
  setState: TSetState,
): TPomodoroSessionViewModel => ({
  phaseLabel: session.phase,
  remainingLabel: formatDuration(session.remainingSeconds),
  onPauseClick: session.status === "running" ? () => onPauseSession(getState, setState) : undefined,
  onResumeClick: session.status === "paused" ? () => onResumeSession(getState, setState) : undefined,
});

export const compilePomodoroViewModel = (
  state: TPomodoroState,
  getState: TGetState,
  setState: TSetState,
): TPomodoroViewModel => ({
  items: state.items.map((item) => {
    const isActive = state.activeSession?.itemId === item.id;
    return {
      id: item.id,
      title: item.title,
      completedLabel: `${item.pomodoro?.completedCount ?? 0} completed`,
      onStartClick: isActive ? undefined : () => onStartSession(item.id, getState, setState),
      session: isActive ? compileSessionViewModel(state.activeSession!, getState, setState) : undefined,
      onRenameClick: (title: string) => onRenameItem(item.id, title, getState, setState),
      onDeleteClick: () => onDeleteItem(item.id, getState, setState),
      onMarkDoneClick: () => onMarkDone(item.id, getState, setState),
    };
  }),
});
