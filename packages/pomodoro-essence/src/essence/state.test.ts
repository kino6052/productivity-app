import { describe, expect, it } from "bun:test";
import { createInitialPomodoroState } from "./state";

describe("createInitialPomodoroState", () => {
  it("starts with no active session and no items", () => {
    expect(createInitialPomodoroState()).toEqual({
      items: [],
      activeSession: null,
    });
  });
});
