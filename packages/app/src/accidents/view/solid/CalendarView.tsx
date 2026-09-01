import { For, type JSX } from "solid-js";
import type { TCalendarItemViewModel, TCalendarViewModel } from "../../../view-models/calendar-view-model";
import { createRenameDeleteActions, useContextMenuTrigger } from "./ContextMenu";

function ItemRow(props: { item: TCalendarItemViewModel; children: (item: TCalendarItemViewModel) => JSX.Element }) {
  const menuTrigger = useContextMenuTrigger(() =>
    createRenameDeleteActions(props.item.title, props.item.onRenameClick, props.item.onDeleteClick),
  );

  return (
    <li class="item-card" {...menuTrigger}>
      <span class="item-card__title">{props.item.title}</span>
      {props.children(props.item)}
    </li>
  );
}

export function CalendarView(props: { vm: TCalendarViewModel }) {
  return (
    <div>
      <h2 class="calendar-day-heading">{props.vm.dayLabel}</h2>
      <ul class="item-list">
        <For each={props.vm.scheduledToday}>
          {(item) => <ItemRow item={item}>{(item) => <button onClick={item.onUnscheduleClick}>Unschedule</button>}</ItemRow>}
        </For>
      </ul>
      <h3 class="calendar-section-heading">Unscheduled</h3>
      <ul class="item-list">
        <For each={props.vm.unscheduled}>
          {(item) => <ItemRow item={item}>{(item) => <button onClick={item.onScheduleClick}>Schedule today</button>}</ItemRow>}
        </For>
      </ul>
    </div>
  );
}
