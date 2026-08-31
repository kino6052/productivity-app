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

- [x] git repo initialized, remote set to `https://github.com/kino6052/productivity-app` (→ local commits made; not yet pushed, see below)
- [x] root `package.json` with bun workspaces (`packages/*`)
- [x] `tsconfig.base.json`
- [x] root `vitest.config.mts` (`bun:test` alias, istanbul coverage, exclude list)
- [x] `scripts/branch-coverage.mjs` ported from conduit (100% branch gate)
- [x] `.gitignore`
- [x] `docs/conventions.md` (condensed essence/accidents + TDD rules for this repo)
- [x] root `README.md`
- [ ] first `git push` to origin (blocked on you fixing `gh auth`/git credentials, and on your go-ahead — see chat)

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
- [ ] `TStateManagement<T>` contract + `createMemoryState()` (deferred until a composition root needs it)

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

- [ ] an item created via notes (note facet) can receive a kanban facet and appear on a board
- [ ] an item with a kanban facet can receive a calendar facet and appear on a day
- [ ] an item with a calendar facet can receive a pomodoro facet and be timed
- [ ] removing one facet leaves the others intact (facets are independent)

## Part 7 — Composition Roots — deferred until essence is solid

- [ ] `index.essence.ts` — essence only, no framework
- [ ] `index.essential-dependencies.ts` — real logic, in-memory adapters
- [ ] `accidents/view/essence` — framework-free HTML grounding tool + `states.ts`
- [ ] `index.ts` — real app (UI framework not chosen yet)

## Part 8 — Real Accidents — deferred

- [x] Firebase config stashed, not wired up (→ `firebaseConfig`, packages/adapters-firebase/src/firebase-config.ts)
- [ ] `persistence-local-storage.ts`
- [ ] `persistence-firebase.ts` (wires the stashed config into a `TPersistence<T>` adapter)
- [ ] auth (explicitly out of scope for this milestone)

## Part 9 — Packaging — future

- [ ] Chrome extension shell (manifest v3)
- [ ] Mobile shell (Capacitor vs. React Native — undecided)
- [ ] CI (GitHub Actions running `test:branches` on push/PR)

## Open Questions

- [ ] Is a "note" strictly plain text for now, or does `note.body` need to support richer block types (checklist, image) from the start? Affects `TItem.note` shape.
- [x] Should nesting (`nestUnder`) accept any item as a parent, or only items that already carry a `note` facet? Resolved: any item — a note can nest under a kanban card or any other item, consistent with "every entity usable in every app." The parent doesn't need a `note` facet itself.
- [ ] Parent/child nesting (with a cycle guard) vs. hanyuOS-style derived slash-tags for organizing notes — nesting was chosen to match "OneNote-like" literally; revisit if it turns out to be more machinery than the app needs.
