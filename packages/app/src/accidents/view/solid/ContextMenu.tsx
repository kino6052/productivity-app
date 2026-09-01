// A single, shared context menu for the whole app -- right-click (desktop)
// or long-press (touch) on any item row opens it with that item's
// actions. Not unit-tested -- real Solid rendering + DOM events, verified
// live, same precedent as every other Solid component here.
import { createContext, createSignal, For, Show, useContext, type JSX, type ParentProps } from "solid-js";

export type TContextMenuAction = {
  label: string;
  onClick: () => void;
};

type TContextMenuState = {
  x: number;
  y: number;
  actions: TContextMenuAction[];
};

type TContextMenuContextValue = {
  open: (x: number, y: number, actions: TContextMenuAction[]) => void;
};

const ContextMenuContext = createContext<TContextMenuContextValue>();

const LONG_PRESS_MS = 500;

export function ContextMenuProvider(props: ParentProps) {
  const [menu, setMenu] = createSignal<TContextMenuState | null>(null);
  const close = () => setMenu(null);

  const open = (x: number, y: number, actions: TContextMenuAction[]) => {
    setMenu({ x, y, actions });
  };

  return (
    <ContextMenuContext.Provider value={{ open }}>
      {props.children}
      <Show when={menu()}>
        {(state) => (
          <>
            {/* Full-screen, invisible -- catches the "close by clicking
                elsewhere" gesture, including a second right-click (which
                would otherwise just reopen the menu at the new spot,
                since the browser's own context menu is already
                suppressed everywhere by the trigger below). */}
            <div
              class="context-menu-backdrop"
              onClick={close}
              onContextMenu={(event) => {
                event.preventDefault();
                close();
              }}
            />
            <ul class="context-menu" style={{ left: `${state().x}px`, top: `${state().y}px` }}>
              <For each={state().actions}>
                {(action) => (
                  <li>
                    <button
                      onClick={() => {
                        action.onClick();
                        close();
                      }}
                    >
                      {action.label}
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </>
        )}
      </Show>
    </ContextMenuContext.Provider>
  );
}

// The standard "Rename"/"Delete" pair every item-row component here
// wants (renameItem/removeItem have existed since Part 1, but nothing in
// the UI triggered them before this). window.prompt is a real browser
// global -- fine here since this is the view layer (an accident), not a
// view-model; view-models stay UI-framework/DOM-free.
export function createRenameDeleteActions(
  title: string,
  onRename: (title: string) => void,
  onDelete: () => void,
): TContextMenuAction[] {
  return [
    {
      label: "Rename",
      onClick: () => {
        const newTitle = window.prompt("Rename to:", title)?.trim();
        if (newTitle) onRename(newTitle);
      },
    },
    { label: "Delete", onClick: onDelete },
  ];
}

// Spread the returned handlers onto any element to make it open the
// shared context menu on right-click or long-press, with the given
// actions.
export function useContextMenuTrigger(getActions: () => TContextMenuAction[]): {
  onContextMenu: JSX.EventHandler<HTMLElement, MouseEvent>;
  onPointerDown: JSX.EventHandler<HTMLElement, PointerEvent>;
  onPointerUp: JSX.EventHandler<HTMLElement, PointerEvent>;
  onPointerMove: JSX.EventHandler<HTMLElement, PointerEvent>;
  onPointerCancel: JSX.EventHandler<HTMLElement, PointerEvent>;
} {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error("useContextMenuTrigger must be used within a ContextMenuProvider");
  }

  let pressTimer: ReturnType<typeof setTimeout> | undefined;

  const cancelPress = () => {
    if (pressTimer !== undefined) clearTimeout(pressTimer);
    pressTimer = undefined;
  };

  return {
    onContextMenu: (event) => {
      event.preventDefault();
      ctx.open(event.clientX, event.clientY, getActions());
    },
    onPointerDown: (event) => {
      if (event.pointerType !== "touch") return;
      const { clientX, clientY } = event;
      pressTimer = setTimeout(() => {
        ctx.open(clientX, clientY, getActions());
      }, LONG_PRESS_MS);
    },
    onPointerUp: cancelPress,
    onPointerMove: cancelPress,
    onPointerCancel: cancelPress,
  };
}
