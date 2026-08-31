# Living Checklist — Essence & Accidents

This is the single source of truth for what's built vs. planned, in the same
spirit as `conduit/docs/realworld-essence-checklist.md`:

- An item is checked off **only in the same commit** that implements it.
- Each checked item gets a pointer: `(→ functionName, path/to/file.ts)`.
- Anything discovered mid-TDD that wasn't anticipated here gets **added** to
  the relevant section immediately — never built silently.
- "Deferred" sections stay unchecked on purpose; they record scope, not a
  promise of order beyond what's stated.

Shared entity model (owned by `packages/core`, extended by facets — see
`docs/conventions.md` for the full rule): one `TItem` carries optional
`pomodoro` / `kanban` / `calendar` / `note` facets. Any item can pick up or
drop a facet independently, which is what makes it usable across every mini
app — a note can become a kanban card, a kanban card can get a due date on
the calendar, a calendar event can be timed with a pomodoro, etc.

## Part 0 — Repo & Tooling (infra/accidents)

- [x] git repo initialized, remote set to `https://github.com/kino6052/productivity-app` (pushed)
- [x] root `package.json` with bun workspaces (`packages/*`)
- [x] `tsconfig.base.json`
- [x] root `vitest.config.mts` (`bun:test` alias, istanbul coverage, exclude list)
- [x] `scripts/branch-coverage.mjs` ported from conduit (100% branch gate)
- [x] `.gitignore`
- [x] `docs/conventions.md` (condensed essence/accidents + TDD rules for this repo)
- [x] root `README.md`
- [x] first `git push` to origin (the git credential-store token worked even though `gh auth` is still broken separately)

## Part 1 — Core Essence (`packages/core`)

Shared shape + generic item lifecycle only — no mini-app-specific behavior.

- [x] `TState` type (→ `TState`, packages/core/src/essence/state.ts)
- [x] `TItem` type: `id`, `title`, `createdAt` (→ `TItem`, packages/core/src/essence/state.ts) + optional facets `pomodoro` (→ `TPomodoroFacet`), `kanban` (→ `TKanbanFacet`), `calendar` (→ `TCalendarFacet`, all packages/core/src/essence/state.ts), `note` (added as notes-essence's TDD requires it)
- [x] `createInitialState()` (→ `createInitialState`, packages/core/src/essence/state.ts)
- [x] `addItem(state, title)` (→ `addItem`, packages/core/src/essence/item.ts)
- [x] `renameItem(state, id, title)` (→ `renameItem`, packages/core/src/essence/rename-item.ts)
- [x] `removeItem(state, id)` (→ `removeItem`, packages/core/src/essence/remove-item.ts)
- [x] `selectItem(state, id)` (→ `selectItem`, packages/core/src/essence/selectors.ts)
- [x] `selectAllItems(state)` (→ `selectAllItems`, packages/core/src/essence/selectors.ts)

## Part 1a — Core Accidents (generic ports)

- [x] `TPersistence<T>` contract + `createMemoryPersistence()` (→ `createMemoryPersistence`, packages/core/src/accidents/persistence/persistence.ts)
- [x] `TStateManagement<T>` contract + `createMemoryState()` (→ `createMemoryState`, packages/core/src/accidents/state-management/state-management.ts)
- [ ] `createRxState()` (RxJS-backed) — deferred until Part 7 picks a UI stack that actually needs it; conduit keeps both in the same file, but adding an rxjs dependency ahead of that decision would be presumptuous

## Part 2 — Pomodoro Essence (`packages/pomodoro-essence`) — BUILD FIRST

- [x] `TPomodoroState` (`TState` + `activeSession`) + `createInitialPomodoroState()` (→ `TPomodoroState`, `createInitialPomodoroState`, packages/pomodoro-essence/src/essence/state.ts)
- [x] `startSession(state, itemId)` — attaches an active session; rejects starting a second one (→ `startSession`, packages/pomodoro-essence/src/essence/start-session.ts)
- [x] `tick(state)` — decrements remaining time; reaching zero flips phase (work ↔ break) and completes the session on work→break (→ `tick`, packages/pomodoro-essence/src/essence/tick.ts)
- [x] `pauseSession(state)` / `resumeSession(state)` (→ `pauseSession`, `resumeSession`, packages/pomodoro-essence/src/essence/pause-resume.ts)
- [x] `completeSession(state, itemId)` — increments the item's `pomodoro.completedCount` (→ `completeSession`, packages/pomodoro-essence/src/essence/complete-session.ts)
- [x] `selectActiveSession(state)` (→ `selectActiveSession`, packages/pomodoro-essence/src/essence/selectors.ts)
- [x] `selectItemsWithPomodoro(state)` (→ `selectItemsWithPomodoro`, packages/pomodoro-essence/src/essence/selectors.ts)

## Part 3 — Kanban Essence (`packages/kanban-essence`) — deferred

- [x] package scaffold only this milestone (→ packages/kanban-essence/package.json)
- [x] `moveItem(state, itemId, toColumn)` — appends the item to the end of the destination column (→ `moveItem`, packages/kanban-essence/src/essence/move-item.ts)
- [x] `reorderItem(state, itemId, toIndex)` — reorders within the item's own column only (→ `reorderItem`, packages/kanban-essence/src/essence/reorder-item.ts)
- [x] `selectItemsByColumn(state, column)` (→ `selectItemsByColumn`, packages/kanban-essence/src/essence/selectors.ts)
- [x] `selectColumns(state)` (→ `selectColumns`, packages/kanban-essence/src/essence/selectors.ts)

## Part 4 — Calendar Essence (`packages/calendar-essence`) — deferred

- [x] package scaffold only this milestone (→ packages/calendar-essence/package.json)
- [x] `scheduleItem(state, itemId, start, end)` (→ `scheduleItem`, packages/calendar-essence/src/essence/schedule-item.ts)
- [x] `unscheduleItem(state, itemId)` (→ `unscheduleItem`, packages/calendar-essence/src/essence/unschedule-item.ts)
- [x] `selectItemsOnDay(state, day)` — matches by UTC calendar date of `calendar.start` (→ `selectItemsOnDay`, packages/calendar-essence/src/essence/selectors.ts)
- [x] `selectItemsInRange(state, start, end)` — matches by `calendar.start` falling within `[start, end]` inclusive (→ `selectItemsInRange`, packages/calendar-essence/src/essence/selectors.ts)

## Part 5 — Notes Essence (`packages/notes-essence`) — new, deferred behind Pomodoro

OneNote-like: any item can carry note content and be nested under another
item, so a notebook → section → page → block tree is just items nesting
items.

Reviewed `C:\Repos\hanyuOS` for a reusable pattern: it's a flat freeform
canvas note app (one `DocumentRecord` per canvas, positioned `CanvasObject`
blocks inside it) with **no** notebook/section/page nesting — organization
is done via derived slash-tag trees (`"Work/ProjectX"`), not a stored
parent/child graph. So there's no existing hierarchy implementation to port;
`nestUnder`/`parentId` below is this project's own design to satisfy the
actual "OneNote-like" ask. Worth remembering slash-tags as a simpler
alternative if `parentId` nesting (and its cycle guard) proves more
complexity than the app needs — see Open Questions.

- [x] package scaffold only this milestone (→ packages/notes-essence/package.json)
- [x] `TNoteFacet` (`body`, `parentId`) added to `TItem` (→ `TNoteFacet`, packages/core/src/essence/state.ts) — resolves the "plain text for now" open question: `body` is a plain `string`
- [x] `addNote(state, itemId, body)` — attaches/updates the note facet, preserving any existing `parentId` (→ `addNote`, packages/notes-essence/src/essence/add-note.ts)
- [x] `nestUnder(state, itemId, parentId)` — sets `note.parentId`, lazily creating an empty-body note facet if the item had none (→ `nestUnder`, packages/notes-essence/src/essence/nest-under.ts)
- [x] `moveOutOfParent(state, itemId)` — clears `parentId` (promotes to a root-level notebook) (→ `moveOutOfParent`, packages/notes-essence/src/essence/move-out-of-parent.ts)
- [x] `selectChildren(state, parentId)` (→ `selectChildren`, packages/notes-essence/src/essence/selectors.ts)
- [x] `selectRootNotes(state)` — note-faceted items with no parent (→ `selectRootNotes`, packages/notes-essence/src/essence/selectors.ts)
- [x] `selectNoteTree(state, rootId)` — full nested tree from a root (→ `selectNoteTree`, packages/notes-essence/src/essence/select-note-tree.ts)
- [x] guard: `nestUnder` rejects creating a cycle (an item can't become its own ancestor) — built into `nestUnder` from the start rather than bolted on (→ `isSelfOrAncestor`, packages/notes-essence/src/essence/nest-under.ts)

## Part 6 — Cross-App Interconnection

Integration-style essence tests proving facets compose freely on one item —
this is the actual proof of "every entity usable in every app."

- [x] an item created via notes (note facet) can receive a kanban facet and appear on a board (→ packages/app/src/essence/cross-app-interconnection.test.ts)
- [x] an item with a kanban facet can receive a calendar facet and appear on a day (→ packages/app/src/essence/cross-app-interconnection.test.ts)
- [x] an item with a calendar facet can receive a pomodoro facet and be timed (→ packages/app/src/essence/cross-app-interconnection.test.ts)
- [x] removing one facet leaves the others intact (facets are independent) (→ packages/app/src/essence/cross-app-interconnection.test.ts)

All four passed against the existing functions with zero new production
code or glue — `packages/app` was scaffolded here specifically as the one
package allowed to depend on every mini-app essence (it doubles as where
Part 7's composition roots will live).

## Part 7 — Composition Roots

UI framework decided: **Solid.js** for the real app (no virtual DOM,
fine-grained signals, React-like API) — chosen specifically for a simpler
rendering model than React while keeping conduit's essence/accidents split.
`createRxState` (Part 1a) stays deferred since Solid's own signals likely
replace what RxJS was doing in conduit's real app; revisit once the real
Solid composition root needs shared reactive state across components.

Building framework-free first (conduit's phase 1), starting with Pomodoro:

- [x] `formatDuration(totalSeconds)` (→ `formatDuration`, packages/app/src/accidents/view/essence/format-duration.ts)
- [x] `renderPomodoro(state)` — item list, start/pause/resume controls, completed counts (→ `renderPomodoro`, packages/app/src/accidents/view/essence/pomodoro.ts)
- [x] `index.essence.ts` — essence only, no framework, wired to `renderPomodoro` (→ `render`, `handleClick`, packages/app/src/index.essence.ts). **Verified live** via the Browser tool at `bun run essence-view` (port 5321): all 5 named states render correctly, and real clicks on Start/Pause/Resume correctly invoke `startSession`/`pauseSession`/`resumeSession` and re-render — not just unit-tested, actually clicked through.
- [x] `states.ts` — 5 named states for Pomodoro grounding (Empty, One item no session, Running session, Paused session, One pomodoro completed) (→ `namedStates`, packages/app/src/accidents/view/essence/states.ts)
- [x] `main.ts` — mount point wiring `index.essence.ts` to the real DOM (→ packages/app/src/accidents/view/essence/main.ts)
- [x] `scripts/serve-essence-view.ts` + `index.html`, ported from conduit, run via `bun run essence-view`
- [x] `renderKanban(state)` — fixed todo/doing/done columns + an inbox for unassigned items, move buttons per item (→ `renderKanban`, packages/app/src/accidents/view/essence/kanban.ts)
- [x] `renderCalendar(state, day)` — items scheduled that day with unschedule buttons, unscheduled items with a schedule-today button (→ `renderCalendar`, packages/app/src/accidents/view/essence/calendar.ts)
- [x] `renderNotes(state)` — recursive tree render via `selectRootNotes`/`selectNoteTree`, add-child button per note (→ `renderNotes`, packages/app/src/accidents/view/essence/notes.ts)

Essence-view render functions now exist for all four mini-apps.

- [x] `index.essence.ts` wires all four render functions as switchable views (pomodoro/kanban/calendar/notes) over **one shared state object** — the direct, clickable proof of the shared-entity architecture. Added `move-item`, `schedule-item`/`unschedule-item`, and `add-child` (chains `addItem` + `nestUnder`) click handlers, plus a `reference-day.ts` fixed date for the calendar grounding tool.
- [x] Added an "One item, usable everywhere" named state (→ `states.ts`) and **verified live** via the Browser tool: the same item, with a note + kanban + calendar facet, correctly appears in all four views; clicking "Move to done" in kanban, "Add child" in notes, and switching views all worked exactly as expected against the real DOM.
- [x] Generic-over-`<S extends TState>` refactor: `addItem`, `renameItem`, `removeItem` (core), `moveItem`, `reorderItem` (kanban), `scheduleItem`, `unscheduleItem` (calendar), `addNote`, `nestUnder`, `moveOutOfParent` (notes) — a real type-safety gap surfaced by `tsc --noEmit` (never run across the whole app package until this point): these functions were typed as `(state: TState) => TState`, so calling them on a `TPomodoroState` value silently widened the type back to `TState`, losing `activeSession` for any later pomodoro-essence call. Fixed by making them generic so the caller's wrapper type flows through unchanged, rather than requiring a manual `{...state, ...result}` merge at every call site. No behavior change — all 98 tests and 100% branch coverage held throughout.
- [ ] `index.essential-dependencies.ts` — real logic, in-memory adapters
- [ ] `index.ts` — real Solid app

## Part 8 — Real Accidents — deferred

- [x] Firebase config stashed, not wired up (→ `firebaseConfig`, packages/adapters-firebase/src/firebase-config.ts)
- [x] `encode`/`decode` — Date-safe JSON codec, needed because `TState` holds real `Date` instances that a naive `JSON.stringify`/`parse` would corrupt into strings (→ `encode`, `decode`, packages/core/src/accidents/persistence/json-codec.ts)
- [x] `persistence-local-storage.ts` — real browser IO, excluded from the coverage gate like conduit's navigation-hash.ts (→ `createLocalStoragePersistence`, packages/core/src/accidents/persistence/persistence-local-storage.ts)
- [x] `persistence-firebase.ts` — Firestore-backed, cache-then-sync (`onSnapshot` keeps a cache that `load()` reads synchronously; documented cold-start race is an accepted limitation, not hidden). Real network IO, excluded from the coverage gate. **Operational note: needs Firestore security rules on the `productivity-1be47` project allowing unauthenticated read/write on this document before it will actually work** — that's a Firebase Console setting, not something committed here (→ `createFirebasePersistence`, packages/adapters-firebase/src/persistence-firebase.ts)
- [ ] auth (explicitly out of scope for this milestone)

## Part 9 — Packaging — future

- [ ] Chrome extension shell (manifest v3)
- [ ] Mobile shell (Capacitor vs. React Native — undecided)
- [ ] CI (GitHub Actions running `test:branches` on push/PR)

## Open Questions

- [ ] Is a "note" strictly plain text for now, or does `note.body` need to support richer block types (checklist, image) from the start? Affects `TItem.note` shape.
- [x] Should nesting (`nestUnder`) accept any item as a parent, or only items that already carry a `note` facet? Resolved: any item — a note can nest under a kanban card or any other item, consistent with "every entity usable in every app." The parent doesn't need a `note` facet itself.
- [ ] Parent/child nesting (with a cycle guard) vs. hanyuOS-style derived slash-tags for organizing notes — nesting was chosen to match "OneNote-like" literally; revisit if it turns out to be more machinery than the app needs.
