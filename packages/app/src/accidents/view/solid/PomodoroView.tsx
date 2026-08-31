// A presentational component -- no logic of its own, just maps a
// TPomodoroViewModel onto DOM. Not unit-tested, same precedent as
// conduit's accidents/view/react/components.ts/pages.ts (real rendering,
// verified live).
import { For, Show } from "solid-js";
import type { TPomodoroViewModel } from "../../../view-models/pomodoro-view-model";

export function PomodoroView(props: { vm: TPomodoroViewModel }) {
  return (
    <ul class="item-list">
      <For each={props.vm.items}>
        {(item) => (
          <li class="item-card">
            <span class="item-card__title">{item.title}</span>
            <span class="item-card__meta">{item.completedLabel}</span>
            <Show when={item.onStartClick}>
              {(onStart) => <button onClick={() => onStart()()}>Start</button>}
            </Show>
            <Show when={item.session}>
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
        )}
      </For>
    </ul>
  );
}
