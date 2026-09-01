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
// assignToProject).
//
// Requested: starting a different item while one is already running
// switches to it -- stops/resets the previous one and starts the one
// just clicked, rather than being rejected. Essence's own startSession
// already does the switch unconditionally (start-session.ts); this adds
// the cross-app half: the newly started item moves to "doing", and
// whichever item was abandoned reverts from "doing" back to "todo" --
// every item that ever became active got moved to "doing" by this same
// function, so there's always a kanban facet to revert. The revert
// happens *before* moving the new item to "doing" so kanban's own order
// count (which counts other items already in the destination column)
// doesn't still count the item that's on its way out. Skipped entirely
// if the abandoned item is somehow already done (defends against ever
// un-completing a finished task -- shouldn't arise any more now that
// onTick/onMarkDone/kanban's onMoveItem all clear activeSession the
// moment an item becomes done, but the guard costs nothing).
//
// startSession is a documented no-op (returns the same reference) only
// when itemId is already the active item -- setState is skipped
// entirely then, same "don't persist a no-op" precedent as onTick.
export const onStartSession = (itemId: string, getState: TGetState, setState: TSetState): void => {
  const prev = getState();
  const previousItemId = prev.activeSession?.itemId;
  const next = startSession(prev, itemId);
  if (next === prev) return;

  let result = next;
  if (previousItemId !== undefined && previousItemId !== itemId) {
    const previousItem = result.items.find((item) => item.id === previousItemId);
    if (previousItem !== undefined && previousItem.kanban?.column !== "done") {
      result = moveItem(result, previousItemId, "todo");
    }
  }
  setState(moveItem(result, itemId, "doing"));
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
//
// Real bug, found live: this used to let tick()'s own break-transition
// stand -- activeSession continuing into "break" for the same item --
// which conflicts with the Completed section (kanban.column === "done"
// hides an item from the active list entirely, requested alongside
// this): activeSession kept pointing at that now-hidden item forever,
// and since the item still exists (just done), startSession's own
// orphan self-heal doesn't catch it -- every future Start on *any* item
// was silently rejected, with no error and no visible reason why.
// Finishing a work phase is now a terminal completion, matching "moves
// to the Completed section" being a done state, not a cue to
// auto-cycle into a break: the session stops outright.
export const onTick = (getState: TGetState, setState: TSetState): void => {
  const prev = getState();
  const next = tick(prev);
  if (next === prev) return;

  const justFinishedWork =
    prev.activeSession?.phase === "work" &&
    next.activeSession?.phase === "break" &&
    next.activeSession.itemId === prev.activeSession.itemId;

  if (justFinishedWork) {
    const itemId = next.activeSession!.itemId;
    setState(moveItem({ ...next, activeSession: null }, itemId, "done"));
    return;
  }

  setState(next);
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

// A completed item drops the pomodoro-specific controls entirely --
// no start/session/mark-done-again, since it's already done. Still
// carries rename/delete (the context menu works the same on either
// section) and its own completedLabel, so a finished item still shows
// its final count.
export type TCompletedPomodoroItemViewModel = {
  id: string;
  title: string;
  completedLabel: string;
  onRenameClick: (title: string) => void;
  onDeleteClick: () => void;
};

export type TPomodoroViewModel = {
  items: TPomodoroItemViewModel[];
  // "Done" here is exactly kanban.column === "done" -- the one signal
  // both the automatic (onTick finishing a work phase) and manual
  // (onMarkDoneClick) completion paths already set (requested: a
  // completed item needs to actually move to its own section on this
  // screen, not just update an invisible kanban facet).
  completed: TCompletedPomodoroItemViewModel[];
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
): TPomodoroViewModel => {
  const isDone = (item: TPomodoroState["items"][number]) => item.kanban?.column === "done";

  return {
    items: state.items
      .filter((item) => !isDone(item))
      .map((item) => {
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
    completed: state.items
      .filter(isDone)
      .map((item) => ({
        id: item.id,
        title: item.title,
        completedLabel: `${item.pomodoro?.completedCount ?? 0} completed`,
        onRenameClick: (title: string) => onRenameItem(item.id, title, getState, setState),
        onDeleteClick: () => onDeleteItem(item.id, getState, setState),
      })),
  };
};
