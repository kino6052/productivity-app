import { describe, expect, it } from "bun:test";
import { createInitialState } from "./state";

describe("createInitialState", () => {
  it("starts with no items", () => {
    expect(createInitialState()).toEqual({ items: [] });
  });
});
