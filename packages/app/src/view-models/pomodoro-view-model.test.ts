import { describe, expect, it } from "bun:test";
import { addItem } from "@productivity-app/core/src/essence/item";
import { createMemoryState } from "@productivity-app/core/src/accidents/state-management/state-management";
import { createInitialPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import type { TPomodoroState } from "@productivity-app/pomodoro-essence/src/essence/state";
import { startSession } from "@productivity-app/pomodoro-essence/src/essence/start-session";
import { WORK_DURATION_SECONDS } from "@productivity-app/pomodoro-essence/src/essence/constants";
import { compilePomodoroViewModel, onTick, onMarkDone, onStartSession } from "./pomodoro-view-model";

describe("compilePomodoroViewModel", () => {
  it("compiles one row per item, with a completed label", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    expect(vm.items).toHaveLength(1);
    expect(vm.items[0].title).toBe("Write report");
    expect(vm.items[0].completedLabel).toBe("0 completed");
  });

  it("gives an item with no active session a start action and no session view-model", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    expect(vm.items[0].onStartClick).toBeInstanceOf(Function);
    expect(vm.items[0].session).toBeUndefined();
  });

  it("onStartClick starts a real session via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onStartClick!();

    expect(memory.getState().activeSession?.itemId).toBe(itemId);
  });

  it("gives the active item no start action, and a running session view-model", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();

    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    expect(vm.items[0].onStartClick).toBeUndefined();
    expect(vm.items[0].session).toEqual({
      phaseLabel: "work",
      remainingLabel: "25:00",
      onPauseClick: expect.any(Function),
      onResumeClick: undefined,
    });
  });

  it("the session's onPauseClick pauses via setState, flipping which action is present", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();
    const running = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    running.items[0].session!.onPauseClick!();

    const paused = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);
    expect(paused.items[0].session).toEqual({
      phaseLabel: "work",
      remainingLabel: "25:00",
      onPauseClick: undefined,
      onResumeClick: expect.any(Function),
    });
  });

  it("onRenameClick renames the item via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onRenameClick("Write final report");

    expect(memory.getState().items[0]).toEqual({ ...state.items[0], title: "Write final report" });
    expect(memory.getState().items[0].id).toBe(itemId);
  });

  it("onDeleteClick removes the item via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
  });

  it("onMarkDoneClick marks the item done via setState (requested: manual done, not just a finished timer)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onMarkDoneClick();

    expect(memory.getState().items[0].kanban).toEqual({ column: "done", order: 0 });
    expect(memory.getState().items[0].pomodoro?.completedCount).toBe(1);
  });

  // Real bug, found live: onMarkDoneClick updated the item's kanban
  // facet, but the Pomodoro screen itself kept showing the item in the
  // same flat active list, with no visual sign it was done at all --
  // "mark done doesn't work properly" was a real symptom, not user error.
  // "Done" here means the same thing kanban's own Done column already
  // means (kanban.column === "done") -- the one signal both the
  // automatic (onTick finishing a work phase) and manual (onMarkDoneClick)
  // completion paths already set, so no separate concept is needed.
  it("moves a done item out of items and into its own completed list", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onMarkDoneClick();

    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    expect(vm.items).toHaveLength(0);
    expect(vm.completed).toHaveLength(1);
    expect(vm.completed[0].title).toBe("Write report");
    expect(vm.completed[0].completedLabel).toBe("1 completed");
  });

  it("leaves a not-yet-done item in items, with an empty completed list", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);

    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    expect(vm.items).toHaveLength(1);
    expect(vm.completed).toHaveLength(0);
  });

  it("keeps an item in items when it has a kanban facet but isn't in the done column yet", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();

    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    expect(memory.getState().items[0].kanban?.column).toBe("doing");
    expect(vm.items).toHaveLength(1);
    expect(vm.completed).toHaveLength(0);
  });

  it("shows 0 completed for a done item that never ran a pomodoro session (e.g. moved to Done directly from Kanban)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const doneWithoutPomodoro: TPomodoroState = {
      ...state,
      items: state.items.map((item) => (item.id === itemId ? { ...item, kanban: { column: "done", order: 0 } } : item)),
    };
    const memory = createMemoryState(doneWithoutPomodoro);

    const vm = compilePomodoroViewModel(doneWithoutPomodoro, memory.getState, memory.setState);

    expect(vm.completed).toHaveLength(1);
    expect(vm.completed[0].completedLabel).toBe("0 completed");
  });

  it("a completed item's rename/delete still work via setState", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onMarkDoneClick();
    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    vm.completed[0].onRenameClick("Final report");
    expect(memory.getState().items[0].title).toBe("Final report");

    vm.completed[0].onDeleteClick();
    expect(memory.getState().items).toHaveLength(0);
  });

  // Real bug, found live: deleting an item whose pomodoro session is
  // currently running left activeSession pointing at an id that no
  // longer existed anywhere -- and since nothing in the UI can ever
  // clear a session except the now-nonexistent item's own pause/resume
  // controls, every future "Start" click was silently rejected forever
  // (startSession's own "already running" guard). Clearing it here, at
  // the moment of deletion, is the first line of defense; startSession's
  // own orphan self-heal (pomodoro-essence) is the second, for state that
  // already got into this shape before this fix existed.
  it("onDeleteClick clears the active session when deleting the item currently running it", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);
    vm.items[0].onStartClick!();
    const running = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    running.items[0].onDeleteClick();

    expect(memory.getState().items).toHaveLength(0);
    expect(memory.getState().activeSession).toBeNull();
  });

  it("onDeleteClick leaves the active session alone when deleting a different item", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "Running"), "Other");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);
    vm.items[0].onStartClick!();
    const running = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);
    const runningItemId = memory.getState().activeSession?.itemId;

    running.items[1].onDeleteClick();

    expect(memory.getState().items).toHaveLength(1);
    expect(memory.getState().activeSession?.itemId).toBe(runningItemId);
  });

  it("onStartClick also moves the item to kanban's doing column (cross-app sync)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);

    vm.items[0].onStartClick!();

    expect(memory.getState().items[0].kanban).toEqual({ column: "doing", order: 0 });
  });

  // Requested: starting a different task while one is already running
  // switches to it, stopping/resetting the previous one, rather than
  // being silently rejected -- essence's own startSession already
  // switches unconditionally (start-session.test.ts); this is the
  // view-model tier's own cross-app half of that: the newly started item
  // becomes "doing", and the abandoned one reverts from "doing" back to
  // "todo" (it was there because starting it always moves an item to
  // "doing" -- see the test above -- so every item that ever became
  // active already has a kanban facet to revert).
  it("onStartClick on a different item switches to it, moving the new one to doing and the old one back to todo", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "First"), "Second");
    const memory = createMemoryState(state);
    const vm = compilePomodoroViewModel(state, memory.getState, memory.setState);
    vm.items[0].onStartClick!();

    compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState).items[1].onStartClick!();

    const after = memory.getState();
    expect(after.activeSession?.itemId).toBe(after.items[1].id);
    expect(after.items[1].kanban).toEqual({ column: "doing", order: 0 });
    expect(after.items[0].kanban?.column).toBe("todo");
  });

  it("resets the abandoned item's timer progress entirely (no partial credit, no way to resume where it left off)", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "First"), "Second");
    const [first, second] = state.items;
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();
    // Simulate the first item's session partway through, to prove its
    // progress is genuinely discarded, not merely paused/preserved.
    memory.setState({
      ...memory.getState(),
      activeSession: { itemId: first.id, phase: "work", remainingSeconds: 42, status: "running" },
    });

    compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState)
      .items.find((i) => i.id === second.id)!
      .onStartClick!();

    const after = memory.getState();
    expect(after.activeSession).toEqual({
      itemId: second.id,
      phase: "work",
      remainingSeconds: WORK_DURATION_SECONDS,
      status: "running",
    });
  });

  it("does not revert the abandoned item to todo if it was already done (would un-complete it)", () => {
    // Can't normally happen any more -- onTick/onMarkDone/onMoveItem all
    // clear activeSession the moment an item becomes done -- but this
    // guards the view-model action itself against ever un-completing a
    // finished task if state is ever in that shape regardless of why.
    const state = addItem(addItem(createInitialPomodoroState(), "Old, done"), "New task");
    const [oldItem, newItem] = state.items;
    const stale: TPomodoroState = {
      ...state,
      items: state.items.map((item) =>
        item.id === oldItem.id ? { ...item, kanban: { column: "done", order: 0 } } : item,
      ),
      activeSession: { itemId: oldItem.id, phase: "work", remainingSeconds: 1500, status: "running" },
    };
    const memory = createMemoryState(stale);
    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);

    vm.items.find((i) => i.id === newItem.id)!.onStartClick!();

    const after = memory.getState();
    expect(after.activeSession?.itemId).toBe(newItem.id);
    expect(after.items.find((i) => i.id === oldItem.id)!.kanban?.column).toBe("done");
  });

  it("clicking start on the already-active item is a no-op -- doesn't call setState at all (no pointless write)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    compilePomodoroViewModel(state, memory.getState, memory.setState).items[0].onStartClick!();
    let setStateCalls = 0;
    const countingSetState = (next: TPomodoroState) => {
      setStateCalls += 1;
      memory.setState(next);
    };
    // onStartClick isn't even offered for the active item in the compiled
    // view-model (isActive gates it away) -- calling the underlying
    // action directly here to prove the essence-level no-op is honored
    // end to end, not just relying on the UI never exposing this path.
    onStartSession(memory.getState().activeSession!.itemId, memory.getState, countingSetState);

    expect(setStateCalls).toBe(0);
    expect(memory.getState().items[0].kanban?.column).toBe("doing");
  });
});

describe("onTick", () => {
  it("is a no-op (doesn't call setState) when tick() itself is a no-op", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const memory = createMemoryState(state);
    let setStateCalls = 0;
    const setState = (next: typeof state) => {
      setStateCalls += 1;
      memory.setState(next);
    };

    onTick(memory.getState, setState);

    expect(setStateCalls).toBe(0);
  });

  it("decrements the running session without touching kanban", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running: TPomodoroState = {
      ...state,
      activeSession: { itemId, phase: "work", remainingSeconds: 10, status: "running" },
    };
    const memory = createMemoryState(running);

    onTick(memory.getState, memory.setState);

    expect(memory.getState().activeSession?.remainingSeconds).toBe(9);
    expect(memory.getState().items[0].kanban).toBeUndefined();
  });

  // Real bug, found live: this used to let tick()'s own break-transition
  // stand (activeSession continuing into "break", same item), which
  // conflicted with the newer Completed-section split (kanban.column ===
  // "done" now hides the item from the active list entirely) --
  // activeSession kept pointing at that now-hidden item forever, and
  // since the item still exists (just done), startSession's own orphan
  // self-heal doesn't catch it either: every future Start on *any* item
  // was silently rejected, with zero visible feedback why. Finishing a
  // work phase is now a terminal completion (matches "moves to the
  // Completed section" being requested as a done state, not a
  // cue to auto-cycle into a break) -- the session stops outright rather
  // than continuing.
  it("moves the item to kanban's done column when a work phase finishes, and stops the session entirely (cross-app sync)", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const aboutToFinish: TPomodoroState = {
      ...state,
      activeSession: { itemId, phase: "work", remainingSeconds: 1, status: "running" },
    };
    const memory = createMemoryState(aboutToFinish);

    onTick(memory.getState, memory.setState);

    expect(memory.getState().activeSession).toBeNull();
    expect(memory.getState().items[0].kanban).toEqual({ column: "done", order: 0 });
    expect(memory.getState().items[0].pomodoro?.completedCount).toBe(1);
  });

  it("a later Start on a different item works after an earlier one finished naturally (no dangling session)", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "First"), "Second");
    const [first, second] = state.items;
    const aboutToFinish: TPomodoroState = {
      ...state,
      activeSession: { itemId: first.id, phase: "work", remainingSeconds: 1, status: "running" },
    };
    const memory = createMemoryState(aboutToFinish);
    onTick(memory.getState, memory.setState);

    const vm = compilePomodoroViewModel(memory.getState(), memory.getState, memory.setState);
    vm.items.find((i) => i.id === second.id)!.onStartClick!();

    expect(memory.getState().activeSession?.itemId).toBe(second.id);
  });
});

describe("onMarkDone", () => {
  it("moves the item to kanban's done column", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const memory = createMemoryState(state);

    onMarkDone(itemId, memory.getState, memory.setState);

    expect(memory.getState().items[0].kanban).toEqual({ column: "done", order: 0 });
  });

  it("increments the item's completed count, same as finishing a work phase naturally does", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const memory = createMemoryState(state);

    onMarkDone(itemId, memory.getState, memory.setState);

    expect(memory.getState().items[0].pomodoro?.completedCount).toBe(1);
  });

  it("stops the timer if this item was the one currently running", () => {
    const state = addItem(createInitialPomodoroState(), "Write report");
    const itemId = state.items[0].id;
    const running = startSession(state, itemId);
    const memory = createMemoryState(running);

    onMarkDone(itemId, memory.getState, memory.setState);

    expect(memory.getState().activeSession).toBeNull();
  });

  it("leaves a different item's running session untouched", () => {
    const state = addItem(addItem(createInitialPomodoroState(), "Running"), "Other");
    const [running, other] = state.items;
    const withSession = startSession(state, running.id);
    const memory = createMemoryState(withSession);

    onMarkDone(other.id, memory.getState, memory.setState);

    expect(memory.getState().activeSession?.itemId).toBe(running.id);
  });
});
