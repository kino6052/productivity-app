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
- [x] `createRxState()` (RxJS-backed) — **resolved as not needed**: Solid.js's own signals (`createSignal`) are the real app's state management, which was the whole reason Solid was picked over React+RxJS. Adding an RxJS dependency to duplicate what Solid already does natively would be presumptuous; `createMemoryState` stays the only `TStateManagement<T>` implementation, used for tests and the essence-view composition roots.

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

**View-model tier** (conduit's `view-model.ts`/`article-view-model.ts` pattern): typed object trees with bound action closures, computed from essence state — testable by asserting on the returned tree directly (structure, labels, presence/absence of optional callbacks), independent of HTML string matching. A separate, parallel tier alongside essence-view, same as conduit keeps its own essence-view and its React view-model independent of each other — this is what a real Solid component would eventually consume.

- [x] `compilePomodoroViewModel(state, getState, setState)` — per-item start action (presence-gated), active item's session sub-view-model (phase/remaining labels, presence-gated pause/resume). Tests use `createMemoryState` as the DI harness (conduit's `compose-app.test.ts` pattern) and assert both the returned tree _and_ that clicking an action genuinely drives the real essence function via `setState` (→ `compilePomodoroViewModel`, packages/app/src/view-models/pomodoro-view-model.ts)
- [x] `compileKanbanViewModel(state, getState, setState)` — inbox + fixed columns, each card carrying move buttons only for columns it isn't already in (→ `compileKanbanViewModel`, packages/app/src/view-models/kanban-view-model.ts)
- [x] `compileCalendarViewModel(state, day, getState, setState)` — schedule/unschedule actions, presence-gated (→ `compileCalendarViewModel`, packages/app/src/view-models/calendar-view-model.ts)
- [x] `compileNotesViewModel(state, getState, setState)` — recursive tree, add-child action creates+nests a real new item via setState (→ `compileNotesViewModel`, packages/app/src/view-models/notes-view-model.ts)

View-model compilers now exist for all four mini-apps, each independently
testable (structure + real action behavior via `createMemoryState`) without
touching HTML or a UI framework at all.

- [x] `index.essence.ts` wires all four render functions as switchable views (pomodoro/kanban/calendar/notes) over **one shared state object** — the direct, clickable proof of the shared-entity architecture. Added `move-item`, `schedule-item`/`unschedule-item`, and `add-child` (chains `addItem` + `nestUnder`) click handlers, plus a `reference-day.ts` fixed date for the calendar grounding tool.
- [x] Added an "One item, usable everywhere" named state (→ `states.ts`) and **verified live** via the Browser tool: the same item, with a note + kanban + calendar facet, correctly appears in all four views; clicking "Move to done" in kanban, "Add child" in notes, and switching views all worked exactly as expected against the real DOM.
- [x] Generic-over-`<S extends TState>` refactor: `addItem`, `renameItem`, `removeItem` (core), `moveItem`, `reorderItem` (kanban), `scheduleItem`, `unscheduleItem` (calendar), `addNote`, `nestUnder`, `moveOutOfParent` (notes) — a real type-safety gap surfaced by `tsc --noEmit` (never run across the whole app package until this point): these functions were typed as `(state: TState) => TState`, so calling them on a `TPomodoroState` value silently widened the type back to `TState`, losing `activeSession` for any later pomodoro-essence call. Fixed by making them generic so the caller's wrapper type flows through unchanged, rather than requiring a manual `{...state, ...result}` merge at every call site. No behavior change — all 98 tests and 100% branch coverage held throughout.
- [x] `App.tsx` — the real Solid composed page: switches between `PomodoroView`/`KanbanView`/`CalendarView`/`NotesView` (all presentational, consuming the view-model tier directly — no HTML strings, no essence knowledge), plus a top-level "Add item" form (the one place a brand-new item gets created; every mini-app view only ever acts on existing items) (→ packages/app/src/accidents/view/solid/App.tsx + `PomodoroView.tsx`/`KanbanView.tsx`/`CalendarView.tsx`/`NotesView.tsx`)
- [x] `index.essential-dependencies.tsx` — same `App`, wired to `createMemoryPersistence` (→ `createEssentialDependenciesApp`, packages/app/src/index.essential-dependencies.tsx)
- [x] `index.tsx` — same `App`, wired to `createFirebasePersistence` (→ `createRealApp`, packages/app/src/index.tsx; `createLocalStoragePersistence` was used at first, then swapped in per request), mounted via `main.tsx` and Vite (`bun run dev` in `packages/app`, or the `app` preview config)
- [x] **Verified live** via the Browser tool: added a real item, started its pomodoro session, confirmed Solid's fine-grained reactivity updates the DOM correctly with no manual `createMemo` needed (Solid's JSX compiler wraps prop expressions in getters automatically), confirmed the same item appears correctly in the kanban view, and — the real proof of `index.tsx` vs. the essence-view/essential-deps tiers — did a genuine full-page reload and confirmed the running session survived via `localStorage`.
- [x] Fixed a real environment issue hit while wiring this up: Vite's default host resolution bound `::1` (IPv6 loopback) only, which this environment's browser/curl couldn't reach ("Bad access" on connect) — fixed with an explicit `host: "127.0.0.1"` in `vite.config.ts`.
- [x] Generalized `kanban-view-model.ts`/`calendar-view-model.ts`/`notes-view-model.ts`'s `TGetState`/`TSetState` to `<S extends TState>` (mirroring the essence-layer fix above) — needed because the composition root has one shared `TPomodoroState` signal that all four `compileXViewModel` calls share; without this, the same type-widening bug would have resurfaced one layer up. No behavior change, all existing tests passed unchanged.
- [x] Real stylesheet (`accidents/view/solid/styles.css`) — styling is itself an accident (conduit's own "essential-ui" delivery is essence-view + a stylesheet, nothing else); wired semantic class names into all four presentational components. Verified live via screenshot: nav tabs, cards, kanban columns, notes tree indentation all render correctly, not just unstyled lists.
- [x] Fixed a real gap found while live-testing: nothing was actually calling `tick()` on a clock — the timer showed `25:00` forever until manually re-triggered. Added a `setInterval`-driven `onMount`/`onCleanup` in `App.tsx` calling `tick()` once a second (safe to call unconditionally; `tick()` is already a documented no-op with no active/running session). **Verified live**: watched the displayed remaining time actually count down in real time across multiple checks.
- [x] Fixed a real gap found while live-testing: `NotesView` had no way to create the _first_ root note — `onAddChildClick` only ever nests under an existing note. Added `compileNotesViewModel`'s `onCreateRootNote(title)` (chains `addItem` + `addNote`, same idiom as `onAddChild`) and a "New notebook" form in `NotesView.tsx`.
- [x] Switched `index.tsx` from `createLocalStoragePersistence` to `createFirebasePersistence` per request, and along the way fixed real bugs this surfaced for the first time (nothing had actually loaded `firebase-config.ts` into a real browser bundle before):
  - **`process.env` doesn't exist in a browser** — `firebase-config.ts` read `process.env.FIREBASE_*`, which worked fine under Bun (scripts/tests) but threw `ReferenceError: process is not defined` the instant the real page loaded, caught live via the console, not assumed. Fixed by switching to `import.meta.env.VITE_FIREBASE_*` (Vite statically replaces `VITE_`-prefixed vars at build time; Bun mirrors `process.env` into `import.meta.env` under the same names, so one code path covers both). `.env`/`.env.example` renamed to the `VITE_` prefix accordingly, and `vite.config.ts` gained `envDir` pointing at the monorepo root so Vite finds the one shared `.env` instead of expecting a `packages/app`-local copy.
  - **`onSnapshot`/`setDoc`/`deleteDoc` had zero error handling** — a denied or failing Firestore call failed completely silently, indistinguishable from "still loading" or "no document yet." Added an `onSnapshot` error callback and `.catch()` on the writes, logging to `console.error` instead of swallowing.
  - **First operational blocker, found via a direct Firestore REST call (`curl`), not guessed**: the Cloud Firestore API had never been enabled on the `productivity-1be47` Google Cloud project at all (`403 PERMISSION_DENIED` / `SERVICE_DISABLED`, with Google's own remediation URL in the response) — a more fundamental prerequisite than security rules. Resolved: the user created the Firestore database via the Firebase Console. A follow-up direct REST `curl` then returned `200 OK` with real document data, confirming this specific blocker was gone.
  - **Second blocker, same live-testing-catches-it pattern**: the user then set security rules to `allow read, write: if request.auth != null` (auth required, not left fully public) — an improvement on the original "public without auth" plan, since a client API key is inherently public once shipped. Confirmed via the new error logging: reads worked, but every write failed with `permission-denied`, live in the console, not assumed.
  - **Fixed with anonymous auth**, scoped entirely to this one accident, not user-facing (`docs/checklist.md`'s "no auth" scope is unchanged — nothing else in essence or any view-model knows a user identity exists): `createFirebasePersistence` now calls `signInAnonymously` on creation and gates Firestore access on `onAuthStateChanged` — `onSnapshot` doesn't attach until signed in, and `save()` queues at most the latest pending value if called before that (a rejected `setDoc` doesn't retry on its own the way a live listener does, so an unqueued write attempted too early would be lost for good, not just delayed).
  - **Also fixed a real bug this exposed**: `App.tsx`'s pomodoro-timer interval called `setState`/persist **every second, unconditionally** — `tick()` returns the exact same state reference as a no-op with nothing running, but the interval never checked for that, so it was writing to Firestore (and, before that, `localStorage`) once a second forever regardless of whether anything changed. Caught by the sheer volume of write-attempt errors flooding the console during live testing. Fixed by only calling `setState` when `tick()`'s result is actually a different reference.
  - **Added a loading state** (per request): Firestore-backed persistence has a real, visible warm-up now (anonymous sign-in, then the first snapshot) that in-memory/`localStorage` persistence never had — without one, the app would flash an empty "New project" screen during that window, indistinguishable from "you genuinely have no projects yet." `index.tsx` tracks `isLoading` (resolved by the same `subscribe()` call that resolves the cold-start race) and `App.tsx` renders a `Loading…` state until then; the prop is optional so `index.essential-dependencies.tsx` (synchronous, nothing to wait for) is unaffected.
  - **Verified live, end to end, for real**: rebuilt, reloaded on a genuinely fresh tab (a stale cached console message with an identical timestamp across "fresh" reloads turned out to be exactly that — stale, from `read_console_messages` retaining history across a reused tab, not a real recurring error — resolved by closing the tab and opening a new one); confirmed zero Firebase-related console errors; created a project through the actual UI; reloaded and confirmed it survived; then confirmed a plain unauthenticated `curl` to the same document now correctly gets `403 PERMISSION_DENIED` — proof the security rule is genuinely enforcing auth, not just permissive by accident.
  - Chrome extension also changed **from a small popup to opening a full tab** per request: removed `action.default_popup` from `manifest.json`, added a `background.js` service worker listening for `chrome.action.onClicked` that opens (or focuses, if already open) `index.html` as a real tab via `chrome.tabs.create`/`chrome.tabs.query`. Verified structurally (build produces the right files with the right content); not clicked through in a real Chrome instance, same caveat as the rest of the extension work.

## Part 8 — Real Accidents — deferred

- [x] Firebase config stashed, not wired up (→ `firebaseConfig`, packages/adapters-firebase/src/firebase-config.ts)
- [x] `encode`/`decode` — Date-safe JSON codec, needed because `TState` holds real `Date` instances that a naive `JSON.stringify`/`parse` would corrupt into strings (→ `encode`, `decode`, packages/core/src/accidents/persistence/json-codec.ts)
- [x] `persistence-local-storage.ts` — real browser IO, excluded from the coverage gate like conduit's navigation-hash.ts (→ `createLocalStoragePersistence`, packages/core/src/accidents/persistence/persistence-local-storage.ts)
- [x] `persistence-firebase.ts` — Firestore-backed, cache-then-sync (`onSnapshot` keeps a cache that `load()` reads synchronously; the cold-start race is resolved via `subscribe()`, used by `index.tsx` — see Part 7). Anonymous auth gates access (see Part 7's entry on this) since the project's rules require `request.auth != null`. Real network IO, excluded from the coverage gate. **Fully working and verified live end to end** — not just wired up (→ `createFirebasePersistence`, packages/adapters-firebase/src/persistence-firebase.ts)
- [x] No user-facing auth (unchanged scope) — anonymous auth exists purely to satisfy Firestore's security rules (see Part 7); there's still no sign-in UI, no user identity anywhere in essence or any view-model. Clients are still shipped with the Firebase web API key/config, which is not a secret by Google's own design (`firebase-config.ts`'s own comment) — access is controlled entirely by Firestore's rules, now requiring at least anonymous auth rather than being fully public.

## Part 9 — Packaging — future

- [x] **Confirmed constraint (requested): no backend server, ever, in any packaged form.** Already true by construction, not something to newly build: every `TPersistence<T>` adapter talks directly from the client — `createMemoryPersistence`/`createLocalStoragePersistence` are pure client-side, and `createFirebasePersistence` uses the Firebase **client** SDK talking directly to Google's managed Firestore, not a server we wrote or run. `scripts/serve-essence-view.ts` and Vite's dev server are build/dev-time tools only — a packaged Chrome extension or mobile build ships static assets and needs neither at runtime. Worth re-checking against this constraint specifically once the extension/mobile shells below are built.
- [x] Chrome extension shell (manifest v3) — the same `packages/app` Vite build doubles as the extension: `public/manifest.json` + `public/background.js` get copied verbatim into `dist/` by Vite; `base: "./"` in `vite.config.ts` makes the built `index.html`'s asset paths relative, resolving correctly from a `chrome-extension://` origin. **Opens as a full tab, not a small popup** (per request): no `action.default_popup`; `background.js`'s service worker listens for `chrome.action.onClicked` and opens (or focuses, if already open) `index.html` via `chrome.tabs.create`/`chrome.tabs.query` — no extra permissions needed for either that or persistence (plain `localStorage`/Firestore's client SDK, not `chrome.storage`). **Verified structurally**: `bun run build` produces a `dist/` with both files present and correct, relative-path `index.html`, hashed assets, no hardcoded dev-server URLs — ready to "Load unpacked." Not loaded into a real Chrome instance and clicked through in this pass (this environment's Browser tool is a sandboxed preview, not a real Chrome you can open `chrome://extensions` in).
- [x] Mobile shell — **Apache Cordova** (a WebView wrapper around the same built web app, not a native rewrite — matches the "keep it simple" ask; Capacitor was floated first and superseded by this choice). `packages/mobile/config.xml` is the real Cordova config (app id, name, `content src="index.html"`); `scripts/sync-www.ts` copies `packages/app/dist` → `packages/mobile/www` (Cordova's WebView loads that directory directly, verified by actually running the script and inspecting the output — no separate mobile build).
- [x] `cordova platform add android` — **actually works**, not just documented as blocked. Hit and fixed a real, reproducible failure first: Cordova's `platform add` shells out to plain `npm install`, and npm auto-detects the repo's bun-workspace root by walking up from wherever it's invoked, then chokes on sibling packages' `workspace:*` specifiers. Fixed by making root `package.json`'s `"workspaces"` an explicit package list rather than a `packages/*` glob (excluding `packages/mobile`, which needs no `@productivity-app/*` linking anyway) — see `docs/conventions.md`. A `.npmrc`-based override was tried first and doesn't work outside the true workspace root; the explicit-list fix does, verified by actually running `cordova platform add android` end to end and getting a real `platforms/android` Gradle project, not a guess.
- [x] `scripts/package-mobile-android.ts` (`bun run mobile:package-android`) — builds `packages/app`, syncs `www/`, adds the Android platform if missing, runs `cordova build android`, and copies the resulting `.apk` into `release/`.
- [x] **Android SDK + Gradle installed on this dev machine, and a real signed-debug APK was actually built and verified.** Installed manually (cmdline-tools 23.0.0, `platforms;android-36`, `build-tools;36.1.0` under `C:\Android\sdk`; Gradle 8.14.2 — the exact version `cordova-android`'s `cdv-gradle-config-defaults.json` requires — under `C:\Android\gradle-8.14.2`, since Cordova won't even attempt the wrapper bootstrap without a system `gradle` on PATH first). Two real, non-obvious problems hit and fixed along the way: (1) the newer "Android CLI" `sdkmanager` shim silently mis-splits semicolon-joined package specs like `platforms;android-36` into separate unrecognized packages — worked around by using the slash-form ids (`platforms/android-36`) with the `android sdk install` subcommand instead, one package per invocation (a combined invocation appears to share one transaction and rolls both back on any single failure); (2) Gradle's own wrapper distribution downloader was severely throttled/stalled in this environment (~1.6 KB/s, confirmed by comparing on-disk byte counts across checks, not assumed from a hung terminal) while plain `curl` to the same Google/Gradle-CDN hosts ran at full speed — worked around by downloading the exact wrapper-expected zip via `curl` directly into Gradle's own wrapper cache path (`~/.gradle/wrapper/dists/<dist>/<hash>/`), which Gradle then detected as already present and used without re-downloading. **Verified for real**: `bun run mobile:package-android` completed with `BUILD SUCCESSFUL in 10m 55s`, producing `release/productivity-app.apk` (3.47 MB), and `aapt dump badging` confirms it's a genuinely valid, parseable APK (`package: name='com.productivityapp.app' versionName='0.1.0' ... targetSdkVersion:'36'`) — sent to the user as a real file, not just reported as built. This SDK/Gradle install lives outside the repo (this machine only); a fresh machine or CI runner still needs the same setup (or `android-actions/setup-android` in CI).
- [x] CI (GitHub Actions running `test:branches` on push/PR) (→ .github/workflows/ci.yml)
- [x] `scripts/package-extension.ts` (`bun run extension:package`) — builds `packages/app` fresh, then zips `dist/`'s *contents* (not a wrapping folder) into `release/productivity-app-extension.zip`, ready to upload to the Chrome Web Store or unzip for "Load unpacked." Uses `archiver` (a cross-platform zip library, not `zip`/`Compress-Archive`, since this needs to run on any contributor's machine) — note its v8 rewrite dropped the commonly-documented `archiver("zip", {...})` factory function for format-specific classes (`ZipArchive`), which the currently-installed version needed. **Verified for real, not just "it printed no errors"**: ran it, then extracted the produced zip and confirmed `manifest.json`/`index.html` sit at the archive's root (not nested under `dist/`) with correct content — genuinely loadable, not just present.
- [ ] Actually loaded into a real Chrome instance via `chrome://extensions` and clicked through — this environment's Browser tool is a sandboxed preview, not a real Chrome; would need either your own browser or explicit go-ahead to attempt via the separate "real Chrome" tool available in this session.

## Part 10 — Projects (new, requested — top-level container)

The main view becomes a **project selector**; each project scopes its own
pomodoro/kanban/calendar/notes. Design, not yet built:

- A project **is an item** (consistent with the shared-entity model), marked
  by a new empty-marker facet `project?: {}` on `TItem`.
- A new cross-cutting field `TItem.projectId?: string` — orthogonal to
  facets, since _any_ item (whatever facets it carries) can belong to a
  project. Not a facet itself; every mini-app's essence stays unaware of it.
- `createProject(state, title)` — `addItem` + tag with the `project` facet,
  same one-step-chain idiom as `onAddChild`.
- `assignToProject(state, itemId, projectId)` — sets `projectId`.
- `selectProjects(state)` — items carrying the `project` facet.
- `selectItemsInProject(state, projectId)` — items whose `projectId` matches.
- **Scoping approach for the four existing mini-app views, without touching
  kanban/calendar/notes/pomodoro-essence at all**: pass a project-filtered
  `state` (`{...state, items: state.items.filter(i => i.projectId === projectId)}`)
  as the _read_ argument into each `compileXViewModel`, while `getState`/
  `setState` stay the full, unscoped pair — every essence action already
  finds its target by item id and only touches that one item, so operating
  against the full state is always safe. This avoids needing a "merge
  scoped writes back into the full state" adapter entirely.
- Every "create a new item" action (`App.tsx`'s top-level Add-item form,
  `onAddChild`/`onCreateRootNote` in notes) needs to tag the new item with
  the current `projectId` (via `assignToProject`) so it's actually visible
  once scoped — an easy thing to silently get wrong.
- `activeSession` (pomodoro) stays **global**, not per-project — one timer
  running at a time regardless of which project you're viewing, matching
  `startSession`'s existing "rejects a second concurrent session" rule.
  Revisit only if per-project concurrent timers turn out to be wanted.
- New `ProjectSelectorView` (+ its own `compileProjectSelectorViewModel`,
  tested the same way as the other four) — lists projects, a create-project
  form, click-to-select; a "back to projects" control once inside one.

- [x] `TItem.projectId` + `TProjectFacet` added to core (→ `TProjectFacet`, `TItem.projectId`, packages/core/src/essence/state.ts)
- [x] `createProject(state, title)` (→ `createProject`, packages/projects-essence/src/essence/create-project.ts)
- [x] `assignToProject(state, itemId, projectId)` (→ `assignToProject`, packages/projects-essence/src/essence/assign-to-project.ts)
- [x] `selectProjects(state)` / `selectItemsInProject(state, projectId)` (→ `selectProjects`, `selectItemsInProject`, packages/projects-essence/src/essence/selectors.ts)
- [x] `compileProjectSelectorViewModel(state, getState, setState)` (→ `compileProjectSelectorViewModel`, packages/app/src/view-models/project-selector-view-model.ts)
- [x] `ProjectSelectorView.tsx` — lists projects, create-project form, click-to-select via an `onSelectProject` callback prop (→ packages/app/src/accidents/view/solid/ProjectSelectorView.tsx)
- [x] Wired project scoping into `App.tsx`: which project is selected is local Solid navigation state (a signal, same treatment as which mini-app tab is active), not essence. A `scopedState()` accessor filters `state().items` by `projectId` and is passed as the _read_ argument into each `compileXViewModel`, while `getState`/`setState` stay the full, unscoped pair (per Part 10's design above) — no changes needed to kanban/calendar/notes/pomodoro-essence at all. A "← Projects" back button clears the selection.
- [x] The top-level "Add item" form and notes' create actions tag new items with the active `projectId` (via `assignToProject`)
- [x] **Verified live**: created two projects ("Website redesign", "Personal errands"), added an item to one and a note to the other, and confirmed neither leaked into the other's Pomodoro, Kanban (same mechanism), Calendar (same mechanism), or Notes view — genuine isolation, not just code review.

- [x] `onAddChild` inherits its parent's `projectId` automatically (no explicit parameter needed — a child belongs to whatever project its parent already does); `onCreateRootNote` takes `projectId` explicitly since a root note has no parent to inherit one from. `compileNotesViewModel` gained an optional `projectId` parameter threading this through (→ packages/app/src/view-models/notes-view-model.ts)

Part 10 (Projects) is functionally complete for this pass.

## Part 11 — Context Menu (new, requested — built)

A right-click (desktop) or long-press (touch) context menu on every item
row across all five item-list views, since the user didn't specify an
action set beyond "popup menu" — resolved to the sensible default of
Rename/Delete (core's `renameItem`/`removeItem` have existed since Part 1,
but nothing in the UI triggered either before this).

Built as one **shared, reusable accident** rather than five separate menu
implementations, since the gesture-handling logic (long-press timing,
suppressing the native context menu, closing on outside-click or a second
right-click) is identical everywhere and only the action list differs:

- [x] `ContextMenuProvider` (Solid Context) — one instance wraps the whole
      app in `App.tsx`; holds the currently-open menu (position + actions)
      as a signal, renders a full-screen invisible backdrop (closes on
      click or on a second right-click, which would otherwise just reopen
      the menu at the new spot since the native menu is suppressed
      everywhere) plus the actual `<ul class="context-menu">` positioned at
      the trigger point (→ `ContextMenuProvider`, packages/app/src/accidents/view/solid/ContextMenu.tsx)
- [x] `useContextMenuTrigger(getActions)` — a hook returning event handlers
      to spread onto any element: `onContextMenu` (right-click, suppresses
      the native menu via `preventDefault`) and a `onPointerDown`/`onPointerUp`/
      `onPointerMove`/`onPointerCancel` set implementing a 500ms long-press
      via Pointer Events, gated to `pointerType === "touch"` so it doesn't
      also fire (redundantly, and with the wrong semantics) on a plain
      mouse click (→ `useContextMenuTrigger`, same file)
- [x] `createRenameDeleteActions(title, onRename, onDelete)` — the standard
      action pair every item row wants; `window.prompt` is a real browser
      global, fine here since this is the view layer (an accident), not a
      view-model — view-models stay UI-framework/DOM-free (→ same file)
- [x] `onRenameClick`/`onDeleteClick` added to all five view-model item
      shapes (`TPomodoroItemViewModel`, `TKanbanCardViewModel`,
      `TCalendarItemViewModel`, `TNoteViewModel`, `TProjectSummaryViewModel`),
      each calling `renameItem`/`removeItem` via `setState` — generic over
      `<S extends TState>` like every other view-model action, tested via
      `createMemoryState` asserting the real state mutation, not just that
      a callback exists (→ `onRenameItem`/`onDeleteItem` in each of
      packages/app/src/view-models/{pomodoro,kanban,calendar,notes,project-selector}-view-model.ts)
- [x] Wired `useContextMenuTrigger` + `createRenameDeleteActions` into all
      five presentational components — `PomodoroView.tsx` (extracted an
      `ItemRow` sub-component), `KanbanView.tsx` (its existing `Card`),
      `CalendarView.tsx` (extracted a shared `ItemRow` used by both the
      `scheduledToday` and `unscheduled` lists, since they were previously
      inline `<li>`s with no sub-component), `NotesView.tsx` (its existing
      `Note`), `ProjectSelectorView.tsx` (extracted a new `ProjectRow`,
      since project rows were previously inline `<li>`s too)
- [x] Known, accepted gap (same one already documented for delete via
      notes/projects in Parts 5/10, not new here): deleting a note or a
      project doesn't cascade — a deleted note's children lose their
      parent but aren't removed or promoted to root; a deleted project's
      member items lose their `projectId` grouping but aren't removed.
      Narrow, known edge case; not solved here.
- [x] `.context-menu`/`.context-menu-backdrop` styles added to
      `styles.css`, matching the existing card/surface/border tokens.
- [x] Typechecked cleanly (`tsc -p packages/app/tsconfig.json --noEmit`,
      zero errors) and full suite verified: 154 tests pass, 100% branch
      coverage held (98/98 branches) — the new view/menu code itself is
      presentational/DOM, same coverage-exclusion precedent as every other
      Solid component and essence-view render function.
- [x] **Verified live** via the Browser tool against the real Firestore-backed
      app (`index.tsx`, not the essence-view or in-memory tiers): right-click
      opened the Rename/Delete menu correctly in all five views (a project
      row, a pomodoro item, a kanban card, both a scheduled and an
      unscheduled calendar item, and a notebook row); clicked Delete in
      each of Project Selector, Kanban, and Calendar and confirmed the row
      actually disappeared — a real round trip through Firestore, not a
      structural-only check. Long-press (touch/`pointerType`) wiring was
      verified structurally (the same hook, same code path as the
      right-click handler already proven live) rather than simulated,
      since this environment's Browser tool doesn't emulate real touch
      pointer events.

## Part 12 — Pomodoro ↔ Kanban Auto-Sync (new, requested — built)

Requested: starting a pomodoro session should automatically show the item
as "in progress" on kanban, and finishing (or otherwise completing) it
should automatically move it to "done".

Kept pomodoro-essence and kanban-essence mutually unaware of each other,
same as every other cross-app interconnection (Part 6) — the orchestration
lives at the **view-model tier**, the same layer that already chains
essence calls across packages (`onCreateProject` chaining `addItem` +
`assignToProject`, Part 10):

- [x] `onStartSession` (pomodoro-view-model.ts) now also calls kanban-essence's
      `moveItem(next, itemId, "doing")` after a session genuinely starts —
      skipped when `startSession` is a no-op (a session is already
      running, returns the same reference), so starting is only "in
      progress" when it actually happened (→ `onStartSession`, packages/app/src/view-models/pomodoro-view-model.ts)
- [x] New `onTick(getState, setState)` wraps `tick()`: detects the
      work → break transition (the same moment `completeSession` already
      fires internally, incrementing `pomodoro.completedCount`) by
      comparing the phase before/after, and calls `moveItem(next, itemId, "done")`
      only on that transition. Also carries forward the existing "skip
      persisting a no-op tick" fix from Part 7 (App.tsx's interval no
      longer needs to know about kanban, or do that comparison itself)
      (→ `onTick`, same file)
- [x] `App.tsx`'s pomodoro clock interval now calls `onTick(props.state, props.setState)`
      instead of `tick()` + a manual reference-equality check — the check
      and the kanban sync both moved into the view-model tier.
- [x] Tested with `createMemoryState`, same idiom as every other
      view-model test: asserts the real `kanban.column` after
      `onStartClick`, confirms a rejected (already-running) start doesn't
      touch kanban, confirms a plain decrementing tick doesn't touch
      kanban, and confirms a work-phase-completing tick does move the
      item to `"done"`. 159 tests pass, 100% branch coverage held
      (107/107).
- [x] **Verified live** against the real Firestore-backed app: added an
      item, clicked Start on its Pomodoro row, and immediately confirmed
      it appeared in Kanban's "Doing" column — a real reactive update
      through Solid + Firestore, not just a unit test. (The "done"
      transition was verified only via the deterministic unit test above,
      not live — the real work phase is 25 minutes long, not something to
      sit through in a live check.)

## Part 13 — Calendar Day/Week/Month Views (new, requested — built)

Requested: "calendar view needs to be able to see day / week / month
view." Built as three layers, essence-first as always:

- [x] `packages/calendar-essence/src/essence/date-range.ts` — pure date
      math, UTC throughout (matching `selectors.ts`'s own `isSameUtcDay`
      convention): `selectDayRange`/`selectWeekRange`/`selectMonthRange`
      each return `{ start, end, days }` (Monday-start ISO week; a Sunday
      reference day correctly lands at the *end* of its own week, not the
      start of the next); `selectDateRange(referenceDay, mode)` dispatches
      to the right one; `shiftReferenceDay(referenceDay, mode, direction)`
      moves the reference day one step in whatever unit the mode shows
      (month-mode intentionally lands on the 1st rather than preserving
      day-of-month, avoiding the usual JS Date overflow, e.g. Jan 31 + 1
      month landing in March) (→ same file). 14 tests, 100% branch
      coverage.
- [x] `compileCalendarViewModel` reshaped to `(state, referenceDay, mode,
      getState, setState)`, returning `{ mode, rangeLabel, days,
      unscheduled }` — one shape regardless of mode (`days` has 1 entry in
      day mode, 7 in week, however many the month has), rather than a
      different field per mode. "Schedule" always targets the reference
      day itself, not the first day of a week/month range, since an
      unscheduled item has no day of its own yet (→ packages/app/src/view-models/calendar-view-model.ts)
- [x] `CalendarView.tsx` — a toolbar (← / rangeLabel / → / Day-Week-Month
      buttons), then one `.calendar-day-group` per entry in `vm.days`
      (a day sub-heading shown only in week/month mode, since day mode's
      own toolbar heading already says which day it is), then the
      existing Unscheduled section. Mode/day navigation is local Solid
      state in `App.tsx` (`calendarMode`/`calendarReferenceDay` signals),
      same treatment as `view`/`projectId` — navigation, not essence data,
      so it has no business in `TState` or any `compileXViewModel`'s
      input.
- [x] The existing context-menu wiring (Part 11) needed no changes at all
      — `ItemRow` still wraps each item regardless of which day-group it's
      nested under.
- [x] Typechecked cleanly, 178 tests pass, 100% branch coverage held
      (121/121).
- [x] **Verified live** against the real Firestore-backed app: switched
      Day → Week → Month and back, confirmed the range label and day
      count are correct for each (a Monday-start week, a full calendar
      month); Prev/Next moved by the correct unit per mode (confirmed a
      month step 2026-09 → 2026-10 → 2026-11 and back); scheduled an item
      while in Day mode on 2026-10-01, switched to Week mode, and
      confirmed it appeared correctly grouped under exactly that day
      (2026-09-28 – 2026-10-04's Wednesday) with every other day in the
      week empty; confirmed right-click Rename/Delete still works on an
      item nested inside a day-group.

## Part 14 — Pomodoro Start Bug Fix + Manual "Mark Done" (new, requested)

Reported: "the pomodoro start doesn't work now." Root-caused live (not
guessed): during Part 12's own live verification, an item with a running
pomodoro session had been deleted through the Kanban view's context menu
before its session was ever stopped. `removeItem` (core) has no idea a
pomodoro session even exists -- `activeSession` lives on `TPomodoroState`,
pomodoro-essence's own extension of the shared `TState`, not on `TItem`
-- so this left `activeSession` pointing at an item id that no longer
existed anywhere. Nothing in the UI could ever reach it again (a
session's own pause/resume controls only render for an item that still
exists), so `startSession`'s own "reject a second concurrent session"
guard silently blocked *every* future "Start" click, forever, with no
error and no way out through the app itself.

- [x] `startSession` (pomodoro-essence) now only blocks a new session if
      the current one's item still actually exists in `state.items` --
      self-heals any state that's already gotten into the orphaned shape,
      by whatever path (→ `startSession`, packages/pomodoro-essence/src/essence/start-session.ts)
- [x] `clearOrphanedPomodoroSession(state, deletedItemId)` -- a new
      shared helper, since Part 11's context menu means *any* of the five
      mini-app views can delete *any* item, and every one of them has its
      own separate `onDeleteItem` (copy-pasted per view, not one shared
      function). Generic over `<S extends TState>`, matching every other
      view-model action -- it's a safe no-op on plain `TState` (no
      `activeSession` field to find) and only does something on the
      actual composition root's real `TPomodoroState` (→ `clearOrphanedPomodoroSession`, packages/app/src/view-models/clear-orphaned-pomodoro-session.ts)
- [x] Wired into **all five** `onDeleteItem` implementations --
      pomodoro-, kanban-, calendar-, notes-, and project-selector-view-model.ts
      -- clearing the session up front, at the moment of deletion, rather
      than relying solely on `startSession`'s own self-heal after the
      fact. A project is itself just an item (with the project facet), so
      it can carry a running session too -- covered the same way.
- [x] **Requested alongside this**: a manual "mark done" action for any
      pomodoro item, not only by letting its 25-minute work phase run out
      naturally. `onMarkDone(itemId, ...)` reuses the exact same
      `completeSession` + move-to-`"done"` pairing `onTick`'s own natural
      completion already does (the completed count goes up either way),
      and additionally stops the timer if this item happens to be the one
      currently running -- marking something done while it's still
      "in progress" would otherwise leave a running session for an item
      that no longer needs one (→ `onMarkDone`, packages/app/src/view-models/pomodoro-view-model.ts). Exposed as an always-visible "Mark done"
      button on every Pomodoro row (→ packages/app/src/accidents/view/solid/PomodoroView.tsx), not tucked into the context menu, since it's a
      primary action.
- [x] Typechecked cleanly, 194 tests pass, 100% branch coverage held
      (130/130).
- [x] **Verified live**, end to end, against the real Firestore-backed
      app -- and the fix genuinely was needed: the actual persisted
      document had exactly the orphaned-session shape this diagnosis
      predicted (confirmed via a read-only inspection of the raw
      Firestore payload, not assumed). After deploying the fix: created a
      fresh item, clicked Start, confirmed it actually started (a
      real ticking timer, not a silent no-op) and simultaneously
      appeared in Kanban's Doing column; clicked "Mark done" on a
      different, already-running item and confirmed it showed "1
      completed", stopped its timer, and moved to Kanban's Done column.
      Cleaned up all live test data through the app itself afterward
      (right-click Delete on each), leaving all four Kanban columns
      empty.
- [x] Incidental finding while debugging this live: the pomodoro clock's
      1-second `setInterval` (`onTick`) recreates fresh view-model object
      trees on every tick, and Solid's `<For>` tracks list items by
      reference -- so *every* `<For>`-rendered list in the app (not just
      Pomodoro's own) gets fully torn down and rebuilt once a second,
      app-wide, regardless of which view is even showing. Not a
      functional bug (nothing observed behaves incorrectly because of
      it), but it made browser-automation clicks against a live-reloading
      page unreliable during this session's verification (DOM element
      references going stale mid-click). Not fixed here -- flagged for a
      future pass if it's ever worth memoizing/keying those view-model
      trees more finely; out of scope for this bug report.

## Part 15 — Completed Section, Timer-as-Accident, and the Full Dangling-Session Fix (requested)

Four related requests landed together, and turned up a deeper design gap
than any one of them alone:

1. "Mark done doesn't work properly, should move it on the pomodoro
   screen in the section 'completed' and have a strike through as well
   as grey out." Part 14's `onMarkDone` updated the kanban facet but
   nothing on the Pomodoro screen itself reflected it.
2. "A task created through notes cannot be started in pomodoro."
3. "We need to add a check in the timer callbacks for whether we are
   stopped to prevent race conditions — we also have to not rely on
   closures but on actual state via getState." (Diagnosing what turned
   out to be a real class of bug, below.)
4. "We shouldn't tie intervals and logic to Solid because it's a view —
   all logic that isn't view lives outside." (A direct architectural
   correction while implementing #3.)
5. "Make sure to rely as little on live debugging and as much on
   view-model tests — try to move as much logic from views and rely on
   autotests." Every fix below (including the notes-can't-start root
   cause) was pinned down with a failing view-model test *before* being
   fixed, not by clicking around live.

**Completed section (#1):**

- [x] `compilePomodoroViewModel` now returns `{ items, completed }`
      instead of one flat `items` list — "done" is exactly
      `kanban.column === "done"`, the same signal every completion path
      already sets, so no new concept was needed. A completed item drops
      to a separate `TCompletedPomodoroItemViewModel` shape with no
      start/session/mark-done-again controls, just rename/delete +
      its final `completedLabel` (→ packages/app/src/view-models/pomodoro-view-model.ts)
- [x] `PomodoroView.tsx` renders a "Completed" heading + section when
      `vm.completed` is non-empty; `.item-card--done` (grey background,
      reduced opacity, strikethrough title) styles it distinctly, not
      just by which section it's in (→ packages/app/src/accidents/view/solid/PomodoroView.tsx,
      styles.css)

**The real dangling-session bug, found underneath #1 and #2 (not
guessed — pinned down with failing tests first, per request #5):**

Splitting the Pomodoro screen by `kanban.column === "done"` exposed that
**"done" was a bigger event than Part 14's fix accounted for.**
`onMarkDone` correctly cleared `activeSession` when *it* was the one
finishing an item — but three other paths could also make an item
"done" without clearing it, each leaving `activeSession` pointing at an
item that still exists (so `startSession`'s existing orphan self-heal,
which only checks *existence*, doesn't catch it) but is now hidden in
the Completed section — silently blocking **every** future Start,
app-wide, with no error and no visible reason why. This is exactly what
"a task created through notes cannot be started" turned out to be: not
anything about notes specifically, just the next Start click after any
one of these gaps fired.

- [x] `onTick`'s natural work-phase completion used to let tick()'s own
      break-transition stand (`activeSession` continuing into "break"
      for the same item) — now a terminal completion: the session stops
      outright the moment the item moves to "done", matching "moves to
      Completed" being a done state, not a cue to auto-cycle into a
      break (→ `onTick`, packages/app/src/view-models/pomodoro-view-model.ts)
- [x] Kanban's own "Move to done" button (`onMoveItem`) didn't know
      pomodoro sessions exist at all — now clears `activeSession` too,
      specifically when the destination column is `"done"`, via the same
      shared helper as delete (→ `onMoveItem`, packages/app/src/view-models/kanban-view-model.ts)
- [x] `clearOrphanedPomodoroSession` broadened from "the item was
      deleted" to the general "an item became ineligible to hold an
      active session" — same mechanics, now documented and used for both
      delete and move-to-done (→ packages/app/src/view-models/clear-orphaned-pomodoro-session.ts)
- [x] Defense in depth, not just prevention: `onStartSession` now treats
      a stale `activeSession` (pointing at an item that's gone *or*
      already done) as if there were none, before attempting to start —
      self-heals any state that got into this shape before the three
      fixes above existed, not just prevents new occurrences (→ `onStartSession`,
      packages/app/src/view-models/pomodoro-view-model.ts)
- [x] Every one of these was caught by writing a failing view-model test
      first (constructing the exact stale/dangling state directly, no
      live clicking involved), confirming red, then fixing — not
      discovered by guessing and not "fixed" without a test proving the
      failure mode first.

**Timer as its own accident, not tied to Solid (#3 and #4):**

- [x] New `packages/core/src/accidents/clock/clock.ts` — `TClock` +
      `createClock(deps?)`, following the same port/factory pattern as
      persistence/state-management. `onInterval(intervalMs, callback)`
      returns a `stop()` that's a **guaranteed no-op guard**, not just a
      `clearInterval` call: even if the underlying timer somehow kept
      firing (e.g. a leaked interval), `stop()` makes the callback do
      nothing from that point on. `setInterval`/`clearInterval` are
      injected (defaulting to the real globals, bound to `globalThis`),
      which is what makes the guard itself actually testable — 6 tests,
      including "stops invoking the callback even if the underlying
      timer keeps firing anyway," the literal race condition this exists
      to prevent.
- [x] **Real bug, caught live**: the real globals need `.bind(globalThis)`
      — a bare `{ setInterval, clearInterval }` destructure throws
      "Illegal invocation" in a real browser (they're native DOM APIs,
      not plain functions detachable from their `this`). Caught by
      actually loading the real app, not assumed — the page was blank
      with a thrown error until this was fixed.
- [x] Removed the raw `setInterval` from `App.tsx`'s `onMount`/`onCleanup`
      entirely — it was tied to the wrong layer to begin with (view
      component lifecycle, not background-process lifecycle), and Solid's
      dev HMR (`vite-plugin-solid`) hot-swapping that component without
      running the previous instance's `onCleanup` first was a real
      mechanism by which a stale interval, still closed over an old
      `getState`/`setState` pair, could keep writing and race a newer
      instance's writes. The clock is now started once, in each
      composition root (`index.tsx` / `index.essential-dependencies.tsx`),
      alongside the state and persistence it drives — not inside the
      returned Solid component at all (→ packages/app/src/accidents/view/solid/App.tsx,
      packages/app/src/index.tsx, packages/app/src/index.essential-dependencies.tsx)
- [x] Every read still goes through `getState()` fresh on each tick
      (`onTick`, `onStartSession`, `onMarkDone` all take `getState`/
      `setState` and call `getState()` themselves) — never a state
      *value* captured in a closure at some earlier point, addressing
      the "not rely on closures but on actual state via getState" half
      of the request directly.
- [x] Typechecked cleanly, 210 tests pass, 100% branch coverage held
      (143/143).
- [x] **Verified live** (lean, after the failing-tests-first work above,
      not instead of it): the "Illegal invocation" fix confirmed on a
      genuinely fresh tab with zero console errors; a note-created item's
      Start button confirmed working end to end against the real
      Firestore-backed app, syncing correctly to Kanban's Doing column.

## Part 16 — Task Switching, Write-Ordering Safety (requested, view-model-test-driven)

Three related requests, all resolved test-first at the view-model/
accident tier per explicit instruction ("make sure to rely as little on
live debugging and as much on view-model tests"):

**"When we start on another task, it should stop/reset the other and
start the one we clicked":**

- [x] `startSession` (pomodoro-essence) simplified to always switch:
      starting a different item replaces whichever session was
      previously active outright (a fresh full-length work phase,
      never resuming wherever the previous one left off), rather than
      rejecting the click. Starting the item that's *already* active
      stays a no-op (doesn't reset its own progress). This also retired
      the essence-level "orphaned/stale session" self-heal Parts 14-15
      built up — there's no more "blocked" state left to guard against,
      since switching always wins regardless of what the previous
      session pointed at (→ `startSession`, packages/pomodoro-essence/src/essence/start-session.ts)
- [x] `onStartSession` (view-model) adds the cross-app half: the newly
      started item moves to kanban's "doing"; whichever item gets
      abandoned reverts from "doing" back to "todo" (every item that
      ever became active got moved to "doing" by this same function, so
      there's always a kanban facet to revert) — skipped if that item is
      somehow already done, so switching away from a running session can
      never accidentally un-complete a finished task. `setState` is
      skipped entirely on the true no-op (starting the already-active
      item), matching the "don't persist a no-op" precedent `onTick`
      already set (→ `onStartSession`, packages/app/src/view-models/pomodoro-view-model.ts)
- [x] 9 new/rewritten tests across both files (switching, resuming vs.
      resetting progress, the already-active no-op, and the
      don't-un-complete-a-done-item guard) — no live clicking involved
      in finding or verifying any of this.

**"Race conditions when starting/stopping/moving done and back" +
"make sure to persist to Firebase in the back (autosave fashion)":**

Autosave itself needed no new work — every view-model action already
routes exclusively through the one injected `setState`, which
`index.tsx`/`index.essential-dependencies.tsx` wire to persist-then-update;
there's no separate "save" step or path that bypasses it. The actual gap
was write *ordering*: view-model actions are synchronous and never await
`save()`, so two state-changing clicks fired close together (e.g. Start
immediately followed by Mark done) would start two independent Firestore
writes with no ordering guarantee between them — whichever happened to
reach the server *last* would win, not necessarily the one that was
logically more recent, silently reverting newer state to something stale.

- [x] New `packages/core/src/accidents/write-queue/write-queue.ts` --
      `createWriteQueue(write, onError)`, generic over the actual write
      function so the ordering guarantee is unit-testable without real
      network IO. Guarantees at most one write in flight at a time and
      coalesces a burst down to only its *latest* value (cheaper than a
      strict FIFO queue too, since each write is a full-document
      replacement, not a delta — sending every intermediate value would
      be wasted traffic for no benefit). 6 tests, including the literal
      race this exists to close: "coalesces a burst that arrives
      mid-write down to just its latest value."
- [x] Wired into `persistence-firebase.ts`'s `writeThrough` — `save()`
      now enqueues onto the write queue instead of firing an independent
      `setDoc()` per call.
- [x] Typechecked cleanly, 220 tests pass, 100% branch coverage held
      (148/148).
- [x] Verified live only as a lean final sanity check (a genuinely fresh
      tab loads with zero console errors), not as the primary proof —
      the switching and write-ordering guarantees are proven by the
      tests above.

## Open Questions

- [x] Is a "note" strictly plain text for now, or does `note.body` need to support richer block types (checklist, image) from the start? Resolved in Part 5: `body` is a plain `string`; richer block types would be a future facet-shape change, not needed yet.
- [x] Should nesting (`nestUnder`) accept any item as a parent, or only items that already carry a `note` facet? Resolved: any item — a note can nest under a kanban card or any other item, consistent with "every entity usable in every app." The parent doesn't need a `note` facet itself.
- [x] Parent/child nesting (with a cycle guard) vs. hanyuOS-style derived slash-tags for organizing notes — resolved: nesting was built, used in the live essence-view (a notebook with a nested page, plus a live "Add child" click test), and didn't turn out to be more machinery than the app needs. Keeping it.
