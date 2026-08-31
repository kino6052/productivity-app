import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { formatDuration } from "./format-duration";

const renderItemRow = (state: TPomodoroState, item: TPomodoroState["items"][number]): string => {
  const completed = item.pomodoro?.completedCount ?? 0;
  const isActive = state.activeSession?.itemId === item.id;

  const control = isActive
    ? renderActiveSessionControls(state.activeSession!)
    : `<button data-action="start-session" data-item-id="${item.id}">Start</button>`;

  return `
    <li data-item-id="${item.id}">
      <span class="pomodoro-item-title">${item.title}</span>
      <span class="pomodoro-item-count">${completed} completed</span>
      ${control}
    </li>
  `;
};

const renderActiveSessionControls = (session: NonNullable<TPomodoroState["activeSession"]>): string => {
  const pauseOrResume =
    session.status === "running"
      ? `<button data-action="pause-session">Pause</button>`
      : `<button data-action="resume-session">Resume</button>`;

  return `
    <span class="pomodoro-phase">${session.phase}</span>
    <span class="pomodoro-remaining">${formatDuration(session.remainingSeconds)}</span>
    ${pauseOrResume}
  `;
};

export const renderPomodoro = (state: TPomodoroState): string =>
  `<ul class="pomodoro-items">${state.items.map((item) => renderItemRow(state, item)).join("")}</ul>`;
