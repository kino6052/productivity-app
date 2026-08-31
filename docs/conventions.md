# Conventions

Practical rules for this repo, condensed from `C:\Repos\conduit\PROMPT.md`
and adapted for a monorepo of interconnected mini apps. See
`docs/checklist.md` for what's built vs. planned.

## Essence vs. accidents

Every capability is **essence** (what a user perceives — minimal, necessary)
wrapped in **accidents** (frameworks, storage, styling, routing — anything
swappable). Test: can you point at it on the screen?

- `packages/*/src/essence/` — pure TypeScript. Zero dependencies: no
  framework, no DOM, no network, no storage.
- `packages/*/src/accidents/` — everything swappable: persistence, state
  management, navigation, confirm dialogs, and eventually the UI.
- **Essence never imports from accidents.** Direction of dependency only
  ever goes accidents → essence.

## Shared entity, facet-based extension

`packages/core` owns `TState`/`TItem`. Every mini app adds an **optional
facet** to `TItem` (`pomodoro?`, `kanban?`, `calendar?`, `note?`) rather than
defining its own competing entity. This is what makes an item usable across
every app — a note can pick up a `kanban` facet and appear on a board, a
kanban card can pick up a `calendar` facet and get a date, etc. A mini app's
essence only ever reads/writes its own facet; it never assumes another
facet is present.

Extending `TItem` for a genuinely new essence-level concept happens in
`packages/core/src/essence/state.ts` (the one place the whole shape lives —
same as conduit's `state.ts`). This is not the "never edit state.ts" rule
conduit applies to *accident-only* fields (pagination, UI flags); adding a
perceivable facet is essence work. What that rule does forbid: an accident
(persistence detail, view-model quirk) leaking a field onto `TItem` that
isn't something the user perceives.

## Naming rules (carried over from conduit)

- No routing/backend vocabulary in state (`title`, not `slug`).
- No redundant derived facts stored alongside the source fact (compute
  `isOverdue` from `calendar.start`; never store it).
- No exposing mechanism names where a perceivable name exists (`signedIn`,
  not `session`/`auth`/`store`).
- One file per perceivable capability in essence — not a god-object service
  per mini app.

**One deviation, deliberate:** conduit identifies entities by natural keys
(an article by its title) to avoid synthetic-id reification. Task/note
titles aren't unique here, so `TItem` carries an `id`. Every other rule above
still applies.

## Ports/adapters

Each accident category is a plain `T<Thing>` object-shape contract (not a
class), plus factory functions:

- The contract + any in-memory/test-double factory live in one file, fully
  unit-tested (e.g. `persistence.ts` exports `TPersistence<T>` and
  `createMemoryPersistence()`).
- Any real-IO implementation lives in a sibling file (e.g.
  `persistence-local-storage.ts`, `persistence-firebase.ts`) and is excluded
  from coverage — it's verified live, not under `bun:test`.

## TDD loop

Mandatory for every change, essence or accident:

1. Write a failing test. Run it. Read the actual failure.
2. Make it pass with the smallest implementation.
3. Refactor — or say explicitly that nothing needed refactoring.
4. Run `bun run test:branches` — must stay at 100% branch coverage for
   everything not on `vitest.config.mts`'s exclude list.
5. Commit. One red/green/refactor cycle = one commit. The message states
   what was verified (tests only, until there's a UI to check live).

Once a mini app has a UI, add step: verify by what it renders (an
essence-view grounding tool + named states), not by clicking through it —
browser automation is unreliable as a verification method; render output is
not.

## Living checklist

`docs/checklist.md` is the source of truth for what's built. An item is
checked off only in the same commit that implements it, with a pointer:
`(→ functionName, path/to/file.ts)`. Anything discovered mid-TDD that wasn't
anticipated gets added to the checklist immediately, not built silently.
