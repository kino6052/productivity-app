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
};

export function App(props: TAppProps) {
  const [view, setView] = createSignal<TViewName>("pomodoro");
  const [projectId, setProjectId] = createSignal<string | undefined>(undefined);
  let titleInput: HTMLInputElement | undefined;

  // The real-time clock driving the pomodoro timer -- tick() itself is a
  // pure essence function (already fully tested); a wall-clock interval
  // calling it once a second is the actual accident. Safe to call
  // unconditionally: tick() is already a documented no-op when there's no
  // active session, or it's paused.
  onMount(() => {
    const intervalId = setInterval(() => props.setState(tick(props.state())), 1000);
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
    </div>
  );
}
