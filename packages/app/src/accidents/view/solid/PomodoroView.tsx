// A presentational component -- no logic of its own, just maps a
// TPomodoroViewModel onto DOM. Not unit-tested, same precedent as
// conduit's accidents/view/react/components.ts/pages.ts (real rendering,
// verified live).
import { For, Show } from "solid-js";
import type { TPomodoroViewModel } from "../../../view-models/pomodoro-view-model";
import { createRenameDeleteActions, useContextMenuTrigger } from "./ContextMenu";

function ItemRow(props: { item: TPomodoroViewModel["items"][number] }) {
  const menuTrigger = useContextMenuTrigger(() =>
    createRenameDeleteActions(props.item.title, props.item.onRenameClick, props.item.onDeleteClick),
  );

  return (
    <li class="item-card" {...menuTrigger}>
      <span class="item-card__title">{props.item.title}</span>
      <span class="item-card__meta">{props.item.completedLabel}</span>
      <Show when={props.item.onStartClick}>
        {(onStart) => <button onClick={() => onStart()()}>Start</button>}
      </Show>
      <Show when={props.item.session}>
        {(session) => (
          <div class="item-card__session">
            <span class="item-card__phase">{session().phaseLabel}</span>
            <span class="item-card__remaining">{session().remainingLabel}</span>
            <Show when={session().onPauseClick}>
              {(onPause) => <button onClick={() => onPause()()}>Pause</button>}
            </Show>
            <Show when={session().onResumeClick}>
              {(onResume) => <button onClick={() => onResume()()}>Resume</button>}
            </Show>
          </div>
        )}
      </Show>
      {/* Requested: mark done directly, not only by letting the timer run
          out -- always available, not gated on a session being active. */}
      <button class="secondary" onClick={props.item.onMarkDoneClick}>
        Mark done
      </button>
    </li>
  );
}

// A completed item's own row -- no start/session/mark-done controls (it's
// already done), styled to actually look finished (requested: strike
// through the title, grey it out) rather than looking identical to an
// active item aside from which section it's in.
function CompletedItemRow(props: { item: TPomodoroViewModel["completed"][number] }) {
  const menuTrigger = useContextMenuTrigger(() =>
    createRenameDeleteActions(props.item.title, props.item.onRenameClick, props.item.onDeleteClick),
  );

  return (
    <li class="item-card item-card--done" {...menuTrigger}>
      <span class="item-card__title">{props.item.title}</span>
      <span class="item-card__meta">{props.item.completedLabel}</span>
    </li>
  );
}

export function PomodoroView(props: { vm: TPomodoroViewModel }) {
  return (
    <div>
      <ul class="item-list">
        <For each={props.vm.items}>{(item) => <ItemRow item={item} />}</For>
      </ul>
      <Show when={props.vm.completed.length > 0}>
        <h3 class="calendar-section-heading">Completed</h3>
        <ul class="item-list">
          <For each={props.vm.completed}>{(item) => <CompletedItemRow item={item} />}</For>
        </ul>
      </Show>
    </div>
  );
}
