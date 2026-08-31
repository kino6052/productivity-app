import { describe, expect, it } from "bun:test";
import { formatDuration } from "./format-duration";

describe("formatDuration", () => {
  it("formats whole minutes as MM:00", () => {
    expect(formatDuration(300)).toBe("05:00");
  });

  it("pads seconds under ten", () => {
    expect(formatDuration(65)).toBe("01:05");
  });

  it("formats under a minute as 00:SS", () => {
    expect(formatDuration(9)).toBe("00:09");
  });
});
