import { For, Show, type JSX } from "solid-js";
import type {
  TCalendarItemViewModel,
  TCalendarViewMode,
  TCalendarViewModel,
} from "../../../view-models/calendar-view-model";
import { createRenameDeleteActions, useContextMenuTrigger } from "./ContextMenu";

const MODES: TCalendarViewMode[] = ["day", "week", "month"];

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

export function CalendarView(props: {
  vm: TCalendarViewModel;
  onModeChange: (mode: TCalendarViewMode) => void;
  onPrevClick: () => void;
  onNextClick: () => void;
}) {
  return (
    <div>
      <div class="calendar-toolbar">
        <button class="calendar-nav-button" onClick={props.onPrevClick} aria-label="Previous">
          ←
        </button>
        <h2 class="calendar-day-heading">{props.vm.rangeLabel}</h2>
        <button class="calendar-nav-button" onClick={props.onNextClick} aria-label="Next">
          →
        </button>
        <nav class="calendar-mode-nav">
          <For each={MODES}>
            {(mode) => (
              <button onClick={() => props.onModeChange(mode)} aria-current={props.vm.mode === mode}>
                {mode}
              </button>
            )}
          </For>
        </nav>
      </div>
      <For each={props.vm.days}>
        {(day) => (
          <div class="calendar-day-group">
            <Show when={props.vm.mode !== "day"}>
              <h4 class="calendar-day-subheading">{day.dayLabel}</h4>
            </Show>
            <ul class="item-list">
              <For each={day.items}>
                {(item) => <ItemRow item={item}>{(item) => <button onClick={item.onUnscheduleClick}>Unschedule</button>}</ItemRow>}
              </For>
            </ul>
          </div>
        )}
      </For>
      <h3 class="calendar-section-heading">Unscheduled</h3>
      <ul class="item-list">
        <For each={props.vm.unscheduled}>
          {(item) => <ItemRow item={item}>{(item) => <button onClick={item.onScheduleClick}>Schedule</button>}</ItemRow>}
        </For>
      </ul>
    </div>
  );
}
