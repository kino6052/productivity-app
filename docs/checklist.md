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

- [ ] git repo initialized, remote set to `https://github.com/kino6052/productivity-app`
- [ ] root `package.json` with bun workspaces (`packages/*`)
- [ ] `tsconfig.base.json`
- [ ] root `vitest.config.mts` (`bun:test` alias, istanbul coverage, exclude list)
- [ ] `scripts/branch-coverage.mjs` ported from conduit (100% branch gate)
- [ ] `.gitignore`
- [ ] `docs/conventions.md` (condensed essence/accidents + TDD rules for this repo)
- [ ] root `README.md`

## Part 1 — Core Essence (`packages/core`)

Shared shape + generic item lifecycle only — no mini-app-specific behavior.

- [x] `TState` type (→ `TState`, packages/core/src/essence/state.ts)
- [ ] `TItem` type: `id`, `title`, `createdAt` (→ `TItem`, packages/core/src/essence/state.ts) + optional facets `pomodoro`, `kanban`, `calendar`, `note` (added as each mini app's TDD requires them)
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

- [ ] `startSession(state, itemId)` — attaches an active session; rejects starting a second one
- [ ] `tick(state)` — decrements remaining time; reaching zero flips phase (work ↔ break)
- [ ] `pauseSession(state)` / `resumeSession(state)`
- [ ] `completeSession(state)` — increments the item's `pomodoro.completedCount`
- [ ] `selectActiveSession(state)`
- [ ] `selectItemsWithPomodoro(state)`

## Part 3 — Kanban Essence (`packages/kanban-essence`) — deferred

- [ ] package scaffold only this milestone
- [ ] `moveItem(state, itemId, toColumn)`
- [ ] `reorderItem(state, itemId, toIndex)`
- [ ] `selectItemsByColumn(state, column)`
- [ ] `selectColumns(state)`

## Part 4 — Calendar Essence (`packages/calendar-essence`) — deferred

- [ ] package scaffold only this milestone
- [ ] `scheduleItem(state, itemId, start, end)`
- [ ] `unscheduleItem(state, itemId)`
- [ ] `selectItemsOnDay(state, day)`
- [ ] `selectItemsInRange(state, start, end)`

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

- [ ] package scaffold only this milestone
- [ ] `addNote(state, itemId, body)` — attaches/updates the note facet on an existing item
- [ ] `nestUnder(state, itemId, parentId)` — sets `note.parentId`
- [ ] `moveOutOfParent(state, itemId)` — clears `parentId` (promotes to a root-level notebook)
- [ ] `selectChildren(state, parentId)`
- [ ] `selectRootNotes(state)` — note-faceted items with no parent
- [ ] `selectNoteTree(state, rootId)` — full nested tree from a root
- [ ] guard: `nestUnder` rejects creating a cycle (an item can't become its own ancestor)

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

- [ ] `persistence-local-storage.ts`
- [ ] `persistence-firebase.ts` (config stashed at `packages/adapters-firebase/src/firebase-config.ts`)
- [ ] auth (explicitly out of scope for this milestone)

## Part 9 — Packaging — future

- [ ] Chrome extension shell (manifest v3)
- [ ] Mobile shell (Capacitor vs. React Native — undecided)
- [ ] CI (GitHub Actions running `test:branches` on push/PR)

## Open Questions

- [ ] Is a "note" strictly plain text for now, or does `note.body` need to support richer block types (checklist, image) from the start? Affects `TItem.note` shape.
- [ ] Should nesting (`nestUnder`) accept any item as a parent, or only items that already carry a `note` facet?
- [ ] Parent/child nesting (with a cycle guard) vs. hanyuOS-style derived slash-tags for organizing notes — nesting was chosen to match "OneNote-like" literally; revisit if it turns out to be more machinery than the app needs.
