import { describe, expect, it } from "bun:test";
import { createMemoryPersistence } from "./persistence";

describe("createMemoryPersistence", () => {
  it("has nothing loaded before anything is saved", () => {
    const persistence = createMemoryPersistence<string>();

    expect(persistence.load()).toBeUndefined();
  });

  it("returns the last saved value", () => {
    const persistence = createMemoryPersistence<string>();

    persistence.save("hello");

    expect(persistence.load()).toBe("hello");
  });

  it("forgets the value after clear", () => {
    const persistence = createMemoryPersistence<string>();
    persistence.save("hello");

    persistence.clear();

    expect(persistence.load()).toBeUndefined();
  });
});
