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
    </li>
  );
}

export function PomodoroView(props: { vm: TPomodoroViewModel }) {
  return (
    <ul class="item-list">
      <For each={props.vm.items}>{(item) => <ItemRow item={item} />}</For>
    </ul>
  );
}
