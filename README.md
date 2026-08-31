# productivity-app

A collection of interconnected mini apps — pomodoro, kanban, calendar, and
notes — over one shared entity. Create a task while timing a pomodoro, drag
it onto a kanban board, give it a slot on the calendar, or start it as a
freeform note: it's the same underlying item the whole way through.

Built essence-first, TDD, dependency-injected — the same methodology as
[`conduit`](https://github.com/kino6052/conduit)'s essence/accidents split
(see `docs/conventions.md` for the full rules). Persistence starts as an
in-memory adapter and will grow a Firebase adapter later, behind the same
swappable port, so the essence never has to change.

- [`docs/conventions.md`](docs/conventions.md) — architecture rules
- [`docs/checklist.md`](docs/checklist.md) — the living build checklist

## Running tests

```bash
bun install
bun run test            # fast loop, bun's own test runner
bun run test:branches   # vitest + istanbul, fails below 100% branch coverage
```
