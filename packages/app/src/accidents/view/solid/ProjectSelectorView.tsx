import { For } from "solid-js";
import type { TProjectSelectorViewModel } from "../../../view-models/project-selector-view-model";

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
          {(project) => (
            <li class="item-card">
              <span class="item-card__title">{project.title}</span>
              <button onClick={() => props.onSelectProject(project.id)}>Open</button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
