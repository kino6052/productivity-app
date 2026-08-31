import { For } from "solid-js";
import type { TCalendarViewModel } from "../../../view-models/calendar-view-model";

export function CalendarView(props: { vm: TCalendarViewModel }) {
  return (
    <div>
      <h2 class="calendar-day-heading">{props.vm.dayLabel}</h2>
      <ul class="item-list">
        <For each={props.vm.scheduledToday}>
          {(item) => (
            <li class="item-card">
              <span class="item-card__title">{item.title}</span>
              <button onClick={item.onUnscheduleClick}>Unschedule</button>
            </li>
          )}
        </For>
      </ul>
      <h3 class="calendar-section-heading">Unscheduled</h3>
      <ul class="item-list">
        <For each={props.vm.unscheduled}>
          {(item) => (
            <li class="item-card">
              <span class="item-card__title">{item.title}</span>
              <button onClick={item.onScheduleClick}>Schedule today</button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
