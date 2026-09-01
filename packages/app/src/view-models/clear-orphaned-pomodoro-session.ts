import type { TState } from "@productivity-app/core/src/essence/state";
import type { TActiveSession } from "@productivity-app/pomodoro-essence/src/essence/state";

// Shared by every mini-app view-model's onDeleteItem (pomodoro, kanban,
// calendar, notes, project-selector -- Part 11's context menu lets any of
// them delete any item). Deleting the item currently holding pomodoro's
// activeSession orphans that session forever if nothing clears it: the
// session's own pause/resume controls only ever render for an item that
// still exists, and startSession's own no-op guard would otherwise reject
// every future session start too (real bug, found live -- see
// docs/checklist.md).
//
// activeSession lives on TPomodoroState, pomodoro-essence's own extension
// of the shared TState, not on TState itself -- kanban/calendar/notes/
// project-selector's own onDeleteItem stay generic over <S extends
// TState> (so they still compile and test against plain TState, no
// pomodoro dependency needed for their own essence). This helper is
// generic the same way and simply does nothing if the state handed to it
// doesn't happen to carry an activeSession field at all -- true for a
// plain TState, and never true for the actual composition root, which
// always threads one shared TPomodoroState through all five view-models.
type TMaybePomodoroState = { activeSession?: TActiveSession | null };

export const clearOrphanedPomodoroSession = <S extends TState>(state: S, deletedItemId: string): S => {
  const session = (state as S & TMaybePomodoroState).activeSession;
  if (session === undefined || session === null || session.itemId !== deletedItemId) {
    return state;
  }
  return { ...state, activeSession: null };
};
