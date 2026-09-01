import type { TState } from "@productivity-app/core/src/essence/state";
import type { TActiveSession } from "@productivity-app/pomodoro-essence/src/essence/state";

// Shared by every path that can make an item ineligible to keep holding
// pomodoro's activeSession: deleting it (every mini-app view-model's own
// onDeleteItem -- Part 11's context menu lets any of them delete any
// item) or moving it straight to kanban's "done" column (kanban-view-model.ts's
// onMoveItem's own "Move to done" button). Leaving activeSession pointing
// at an item that's gone, or done, orphans it forever if nothing clears
// it: a session's own pause/resume controls only ever render for an item
// that both still exists *and* isn't done, and startSession's own no-op
// guard would otherwise reject every future session start too (real bug,
// found live twice -- once for delete, once for "Move to done" -- see
// docs/checklist.md).
//
// activeSession lives on TPomodoroState, pomodoro-essence's own extension
// of the shared TState, not on TState itself -- kanban/calendar/notes/
// project-selector's own onDeleteItem (and kanban's own onMoveItem) stay
// generic over <S extends TState> (so they still compile and test against
// plain TState, no pomodoro dependency needed for their own essence).
// This helper is generic the same way and simply does nothing if the
// state handed to it doesn't happen to carry an activeSession field at
// all -- true for a plain TState, and never true for the actual
// composition root, which always threads one shared TPomodoroState
// through every view-model.
type TMaybePomodoroState = { activeSession?: TActiveSession | null };

export const clearOrphanedPomodoroSession = <S extends TState>(state: S, itemId: string): S => {
  const session = (state as S & TMaybePomodoroState).activeSession;
  if (session === undefined || session === null || session.itemId !== itemId) {
    return state;
  }
  return { ...state, activeSession: null };
};
