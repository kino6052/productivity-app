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
- [x] `index.tsx` — same `App`, wired to `createLocalStoragePersistence` (→ `createRealApp`, packages/app/src/index.tsx), mounted via `main.tsx` and Vite (`bun run dev` in `packages/app`, or the `app` preview config)
- [x] **Verified live** via the Browser tool: added a real item, started its pomodoro session, confirmed Solid's fine-grained reactivity updates the DOM correctly with no manual `createMemo` needed (Solid's JSX compiler wraps prop expressions in getters automatically), confirmed the same item appears correctly in the kanban view, and — the real proof of `index.tsx` vs. the essence-view/essential-deps tiers — did a genuine full-page reload and confirmed the running session survived via `localStorage`.
- [x] Fixed a real environment issue hit while wiring this up: Vite's default host resolution bound `::1` (IPv6 loopback) only, which this environment's browser/curl couldn't reach ("Bad access" on connect) — fixed with an explicit `host: "127.0.0.1"` in `vite.config.ts`.
- [x] Generalized `kanban-view-model.ts`/`calendar-view-model.ts`/`notes-view-model.ts`'s `TGetState`/`TSetState` to `<S extends TState>` (mirroring the essence-layer fix above) — needed because the composition root has one shared `TPomodoroState` signal that all four `compileXViewModel` calls share; without this, the same type-widening bug would have resurfaced one layer up. No behavior change, all existing tests passed unchanged.
- [x] Real stylesheet (`accidents/view/solid/styles.css`) — styling is itself an accident (conduit's own "essential-ui" delivery is essence-view + a stylesheet, nothing else); wired semantic class names into all four presentational components. Verified live via screenshot: nav tabs, cards, kanban columns, notes tree indentation all render correctly, not just unstyled lists.
- [x] Fixed a real gap found while live-testing: nothing was actually calling `tick()` on a clock — the timer showed `25:00` forever until manually re-triggered. Added a `setInterval`-driven `onMount`/`onCleanup` in `App.tsx` calling `tick()` once a second (safe to call unconditionally; `tick()` is already a documented no-op with no active/running session). **Verified live**: watched the displayed remaining time actually count down in real time across multiple checks.
- [x] Fixed a real gap found while live-testing: `NotesView` had no way to create the _first_ root note — `onAddChildClick` only ever nests under an existing note. Added `compileNotesViewModel`'s `onCreateRootNote(title)` (chains `addItem` + `addNote`, same idiom as `onAddChild`) and a "New notebook" form in `NotesView.tsx`.

## Part 8 — Real Accidents — deferred

- [x] Firebase config stashed, not wired up (→ `firebaseConfig`, packages/adapters-firebase/src/firebase-config.ts)
- [x] `encode`/`decode` — Date-safe JSON codec, needed because `TState` holds real `Date` instances that a naive `JSON.stringify`/`parse` would corrupt into strings (→ `encode`, `decode`, packages/core/src/accidents/persistence/json-codec.ts)
- [x] `persistence-local-storage.ts` — real browser IO, excluded from the coverage gate like conduit's navigation-hash.ts (→ `createLocalStoragePersistence`, packages/core/src/accidents/persistence/persistence-local-storage.ts)
- [x] `persistence-firebase.ts` — Firestore-backed, cache-then-sync (`onSnapshot` keeps a cache that `load()` reads synchronously; documented cold-start race is an accepted limitation, not hidden). Real network IO, excluded from the coverage gate. **Operational note: needs Firestore security rules on the `productivity-1be47` project allowing unauthenticated read/write on this document before it will actually work** — that's a Firebase Console setting, not something committed here (→ `createFirebasePersistence`, packages/adapters-firebase/src/persistence-firebase.ts)
- [ ] no auth - we package clients with api keys

## Part 9 — Packaging — future

- [x] **Confirmed constraint (requested): no backend server, ever, in any packaged form.** Already true by construction, not something to newly build: every `TPersistence<T>` adapter talks directly from the client — `createMemoryPersistence`/`createLocalStoragePersistence` are pure client-side, and `createFirebasePersistence` uses the Firebase **client** SDK talking directly to Google's managed Firestore, not a server we wrote or run. `scripts/serve-essence-view.ts` and Vite's dev server are build/dev-time tools only — a packaged Chrome extension or mobile build ships static assets and needs neither at runtime. Worth re-checking against this constraint specifically once the extension/mobile shells below are built.
- [x] Chrome extension shell (manifest v3) — the same `packages/app` Vite build doubles as the extension: `public/manifest.json` (`action.default_popup: "index.html"`, no `permissions` needed since we use plain `localStorage`, not `chrome.storage`) gets copied verbatim into `dist/` by Vite; `base: "./"` in `vite.config.ts` makes the built `index.html`'s asset paths relative, resolving correctly from a `chrome-extension://` origin. **Verified structurally**: `bun run build` in `packages/app` produces a `dist/` with `manifest.json` + relative-path `index.html` + hashed assets, and the built JS contains no hardcoded dev-server URLs — ready to "Load unpacked." Not loaded into a real Chrome instance and clicked through in this pass (this environment's Browser tool is a sandboxed preview, not a real Chrome you can open `chrome://extensions` in).
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

## Part 11 — Context Menu (new, requested — not yet designed)

A right-click (or long-press) context menu on items, for quick actions.
Not yet designed: which actions belong on it (rename? delete? assign to
project? per-facet shortcuts like "start pomodoro" from anywhere?), and
whether it's one generic menu component parameterized by a list of
actions (matching the view-model tier's own presence-gated-action style)
or per-mini-app-view menus. Needs a scoping conversation before building —
tracked here so it isn't lost, not started.

- [ ] Decide the action set and whether delete exists yet (core has no
      `removeItem`-triggering UI anywhere currently — worth resolving
      alongside this, since a context menu is the natural place for it)
- [ ] Design the menu as its own testable view-model tier item, same
      pattern as the four mini-app compilers
- [ ] Build + verify live

## Open Questions

- [x] Is a "note" strictly plain text for now, or does `note.body` need to support richer block types (checklist, image) from the start? Resolved in Part 5: `body` is a plain `string`; richer block types would be a future facet-shape change, not needed yet.
- [x] Should nesting (`nestUnder`) accept any item as a parent, or only items that already carry a `note` facet? Resolved: any item — a note can nest under a kanban card or any other item, consistent with "every entity usable in every app." The parent doesn't need a `note` facet itself.
- [x] Parent/child nesting (with a cycle guard) vs. hanyuOS-style derived slash-tags for organizing notes — resolved: nesting was built, used in the live essence-view (a notebook with a nested page, plus a live "Add child" click test), and didn't turn out to be more machinery than the app needs. Keeping it.
