import { describe, expect, it } from "bun:test";
import { decode, encode } from "./json-codec";

describe("encode/decode", () => {
  it("round-trips plain values with no dates", () => {
    const value = { title: "Buy milk", tags: ["errand", "home"] };

    expect(decode(encode(value))).toEqual(value);
  });

  it("round-trips a Date value, restoring a real Date instance", () => {
    const value = { createdAt: new Date("2026-09-01T10:00:00.000Z") };

    const result = decode<typeof value>(encode(value));

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.getTime()).toBe(value.createdAt.getTime());
  });

  it("round-trips Dates nested inside arrays and objects", () => {
    const value = {
      items: [
        { id: "1", createdAt: new Date("2026-09-01T10:00:00.000Z") },
        { id: "2", createdAt: new Date("2026-09-02T10:00:00.000Z"), calendar: { start: new Date("2026-09-03T00:00:00.000Z"), end: new Date("2026-09-03T01:00:00.000Z") } },
      ],
    };

    const result = decode<typeof value>(encode(value));

    expect(result.items[0].createdAt).toBeInstanceOf(Date);
    expect(result.items[1].calendar!.start).toBeInstanceOf(Date);
    expect(result.items[1].calendar!.start.getTime()).toBe(value.items[1].calendar!.start.getTime());
  });
});
