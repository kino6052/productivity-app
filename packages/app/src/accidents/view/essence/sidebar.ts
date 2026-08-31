// Ported from conduit's sidebar.ts verbatim -- fully generic, doesn't know
// about items/pomodoro/kanban/calendar/notes at all, so it's genuine reuse
// rather than a copy adapted for this domain.
export function renderSidebar(names: string[], activeName: string): string {
  const items = names
    .map((name) => {
      const current = name === activeName ? ` aria-current="true"` : "";
      return `<li><button data-action="select-state" data-state-name="${name}"${current}>${name}</button></li>`;
    })
    .join("");

  return `<nav><ul>${items}</ul></nav>`;
}
