import type { TItem, TState } from "@productivity-app/core/src/essence/state";
import { selectItemsOnDay } from "@productivity-app/calendar-essence/src/essence/selectors";

const isoDay = (day: Date): string => day.toISOString().slice(0, 10);

const renderScheduledItem = (item: TItem): string =>
  `<li data-item-id="${item.id}">${item.title} <button data-action="unschedule-item" data-item-id="${item.id}">Unschedule</button></li>`;

const renderUnscheduledItem = (item: TItem): string =>
  `<li data-item-id="${item.id}">${item.title} <button data-action="schedule-item" data-item-id="${item.id}">Schedule today</button></li>`;

const selectUnscheduledItems = (state: TState): TItem[] =>
  state.items.filter((item) => item.calendar === undefined);

export const renderCalendar = (state: TState, day: Date): string =>
  `<h2>${isoDay(day)}</h2>` +
  `<ul>${selectItemsOnDay(state, day).map(renderScheduledItem).join("")}</ul>` +
  `<h3>Unscheduled</h3>` +
  `<ul>${selectUnscheduledItems(state).map(renderUnscheduledItem).join("")}</ul>`;
