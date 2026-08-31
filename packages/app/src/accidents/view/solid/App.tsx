// THE Solid delivery's composed page -- takes injected state as a signal
// pair (same getState/setState shape every view-model already expects, so
// no adapter needed) and switches between the four mini-app views. Not
// unit-tested -- real Solid rendering, verified live, same precedent as
// conduit's compose-app.ts + pages.ts. index.essential-dependencies.tsx
// and index.tsx (the actual composition roots) differ only in which
// TPersistence<T> backs the initial state and every write.
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { tick } from "@productivity-app/pomodoro-essence/src/essence/tick";
import { addItem } from "@productivity-app/core/src/essence/item";
import { compilePomodoroViewModel } from "../../../view-models/pomodoro-view-model";
import { compileKanbanViewModel } from "../../../view-models/kanban-view-model";
import { compileCalendarViewModel } from "../../../view-models/calendar-view-model";
import { compileNotesViewModel } from "../../../view-models/notes-view-model";
import { PomodoroView } from "./PomodoroView";
import { KanbanView } from "./KanbanView";
import { CalendarView } from "./CalendarView";
import { NotesView } from "./NotesView";

type TViewName = "pomodoro" | "kanban" | "calendar" | "notes";
const VIEWS: TViewName[] = ["pomodoro", "kanban", "calendar", "notes"];

export type TAppProps = {
  state: () => TPomodoroState;
  setState: (next: TPomodoroState) => void;
  today: Date;
};

export function App(props: TAppProps) {
  const [view, setView] = createSignal<TViewName>("pomodoro");
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
  // need from any view.
  const onAddItem = (event: SubmitEvent) => {
    event.preventDefault();
    const title = titleInput?.value.trim();
    if (!title) return;
    props.setState(addItem(props.state(), title));
    if (titleInput) titleInput.value = "";
  };

  return (
    <div class="app">
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
        <PomodoroView vm={compilePomodoroViewModel(props.state(), props.state, props.setState)} />
      </Show>
      <Show when={view() === "kanban"}>
        <KanbanView vm={compileKanbanViewModel(props.state(), props.state, props.setState)} />
      </Show>
      <Show when={view() === "calendar"}>
        <CalendarView
          vm={compileCalendarViewModel(props.state(), props.today, props.state, props.setState)}
        />
      </Show>
      <Show when={view() === "notes"}>
        <NotesView vm={compileNotesViewModel(props.state(), props.state, props.setState)} />
      </Show>
    </div>
  );
}
