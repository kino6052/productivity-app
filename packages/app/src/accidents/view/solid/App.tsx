// THE Solid delivery's composed page -- takes injected state as a signal
// pair (same getState/setState shape every view-model already expects, so
// no adapter needed). The main view is a project selector; picking a
// project scopes the four mini-app views to it. Not unit-tested -- real
// Solid rendering, verified live, same precedent as conduit's
// compose-app.ts + pages.ts. index.essential-dependencies.tsx and
// index.tsx (the actual composition roots) differ only in which
// TPersistence<T> backs the initial state and every write.
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { tick } from "@productivity-app/pomodoro-essence/src/essence/tick";
import { addItem } from "@productivity-app/core/src/essence/item";
import { assignToProject } from "@productivity-app/projects-essence/src/essence/assign-to-project";
import { compilePomodoroViewModel } from "../../../view-models/pomodoro-view-model";
import { compileKanbanViewModel } from "../../../view-models/kanban-view-model";
import { compileCalendarViewModel } from "../../../view-models/calendar-view-model";
import { compileNotesViewModel } from "../../../view-models/notes-view-model";
import { compileProjectSelectorViewModel } from "../../../view-models/project-selector-view-model";
import { PomodoroView } from "./PomodoroView";
import { KanbanView } from "./KanbanView";
import { CalendarView } from "./CalendarView";
import { NotesView } from "./NotesView";
import { ProjectSelectorView } from "./ProjectSelectorView";

type TViewName = "pomodoro" | "kanban" | "calendar" | "notes";
const VIEWS: TViewName[] = ["pomodoro", "kanban", "calendar", "notes"];

export type TAppProps = {
  state: () => TPomodoroState;
  setState: (next: TPomodoroState) => void;
  today: Date;
  // Optional: only index.tsx's Firestore-backed persistence has a real
  // warm-up period (anonymous sign-in, then the first snapshot) worth
  // showing a loading state for. index.essential-dependencies.tsx's
  // in-memory persistence resolves synchronously, so it has nothing to
  // pass here -- defaults to "not loading".
  isLoading?: () => boolean;
};

export function App(props: TAppProps) {
  const [view, setView] = createSignal<TViewName>("pomodoro");
  const [projectId, setProjectId] = createSignal<string | undefined>(undefined);
  const isLoading = () => props.isLoading?.() ?? false;
  let titleInput: HTMLInputElement | undefined;

  // The real-time clock driving the pomodoro timer -- tick() itself is a
  // pure essence function (already fully tested); a wall-clock interval
  // calling it once a second is the actual accident. tick() is a
  // documented no-op with no active/running session -- returning the
  // exact same state reference, not a new object -- so skip persisting
  // when it didn't actually change anything. Calling setState/persist
  // unconditionally every second here (the original version of this
  // code) was a real bug: with no session running, it fired the same
  // no-op write once a second forever, both to localStorage and, once
  // wired up, to Firestore -- caught by the sheer number of write
  // attempts visible in the console during live testing, not by
  // inspection.
  onMount(() => {
    const intervalId = setInterval(() => {
      const next = tick(props.state());
      if (next !== props.state()) {
        props.setState(next);
      }
    }, 1000);
    onCleanup(() => clearInterval(intervalId));
  });

  // The one place a brand-new top-level item gets created -- every
  // mini-app view only ever acts on items that already exist (moving,
  // scheduling, timing, nesting a *child*). Creating a bare item is a
  // core capability, not any one mini-app's, matching the shared-entity
  // philosophy: create it here, then develop it into whatever facet you
  // need from any view. Tagged with the current project, if any, so it's
  // actually visible once scoped.
  const onAddItem = (event: SubmitEvent) => {
    event.preventDefault();
    const title = titleInput?.value.trim();
    if (!title) return;
    const withItem = addItem(props.state(), title);
    const itemId = withItem.items[withItem.items.length - 1].id;
    const activeProjectId = projectId();
    props.setState(activeProjectId === undefined ? withItem : assignToProject(withItem, itemId, activeProjectId));
    if (titleInput) titleInput.value = "";
  };

  // Read-only, project-filtered view of state -- passed as the *read*
  // argument into each compileXViewModel below, while getState/setState
  // (props.state/props.setState) stay the full, unscoped pair. Every
  // essence action already finds its target by item id and only touches
  // that one item, so operating against the full state on write is always
  // safe -- this avoids needing to merge scoped writes back into the full
  // state at all (docs/checklist.md, Part 10).
  const scopedState = () => {
    const currentProjectId = projectId();
    const full = props.state();
    return currentProjectId === undefined
      ? full
      : { ...full, items: full.items.filter((item) => item.projectId === currentProjectId) };
  };

  return (
    <div class="app">
      <Show when={!isLoading()} fallback={<p class="loading-state">Loading…</p>}>
        <Show
          when={projectId()}
          fallback={
            <ProjectSelectorView
              vm={compileProjectSelectorViewModel(props.state(), props.state, props.setState)}
              onSelectProject={setProjectId}
            />
          }
        >
          <button class="back-button" onClick={() => setProjectId(undefined)}>
            ← Projects
          </button>
          <form class="add-item-form" onSubmit={onAddItem}>
            <input ref={titleInput} placeholder="New item title" />
            <button type="submit">Add item</button>
          </form>
          <nav class="view-nav">
            <For each={VIEWS}>
              {(v) => (
                <button onClick={() => setView(v)} aria-current={view() === v}>
                  {v}
                </button>
              )}
            </For>
          </nav>
          <Show when={view() === "pomodoro"}>
            <PomodoroView vm={compilePomodoroViewModel(scopedState(), props.state, props.setState)} />
          </Show>
          <Show when={view() === "kanban"}>
            <KanbanView vm={compileKanbanViewModel(scopedState(), props.state, props.setState)} />
          </Show>
          <Show when={view() === "calendar"}>
            <CalendarView
              vm={compileCalendarViewModel(scopedState(), props.today, props.state, props.setState)}
            />
          </Show>
          <Show when={view() === "notes"}>
            <NotesView vm={compileNotesViewModel(scopedState(), props.state, props.setState, projectId())} />
          </Show>
        </Show>
      </Show>
    </div>
  );
}
