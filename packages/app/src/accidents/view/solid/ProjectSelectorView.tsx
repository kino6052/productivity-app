import { For } from "solid-js";
import type { TProjectSelectorViewModel, TProjectSummaryViewModel } from "../../../view-models/project-selector-view-model";
import { createRenameDeleteActions, useContextMenuTrigger } from "./ContextMenu";

function ProjectRow(props: { project: TProjectSummaryViewModel; onSelectProject: (projectId: string) => void }) {
  const menuTrigger = useContextMenuTrigger(() =>
    createRenameDeleteActions(props.project.title, props.project.onRenameClick, props.project.onDeleteClick),
  );

  return (
    <li class="item-card" {...menuTrigger}>
      <span class="item-card__title">{props.project.title}</span>
      <button onClick={() => props.onSelectProject(props.project.id)}>Open</button>
    </li>
  );
}

export function ProjectSelectorView(props: {
  vm: TProjectSelectorViewModel;
  onSelectProject: (projectId: string) => void;
}) {
  let titleInput: HTMLInputElement | undefined;

  const onCreateProject = (event: SubmitEvent) => {
    event.preventDefault();
    const title = titleInput?.value.trim();
    if (!title) return;
    props.vm.onCreateProject(title);
    if (titleInput) titleInput.value = "";
  };

  return (
    <div>
      <form class="add-item-form" onSubmit={onCreateProject}>
        <input ref={titleInput} placeholder="New project name" />
        <button type="submit">New project</button>
      </form>
      <ul class="item-list">
        <For each={props.vm.projects}>
          {(project) => <ProjectRow project={project} onSelectProject={props.onSelectProject} />}
        </For>
      </ul>
    </div>
  );
}
