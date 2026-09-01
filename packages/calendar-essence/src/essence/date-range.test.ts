import { describe, expect, it } from "bun:test";
import { selectDateRange, selectDayRange, selectMonthRange, selectWeekRange, shiftReferenceDay } from "./date-range";

describe("selectDayRange", () => {
  it("returns a single-day range for the given day", () => {
    const range = selectDayRange(new Date("2026-09-03T14:00:00Z"));

    expect(range.start.toISOString().slice(0, 10)).toBe("2026-09-03");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-09-03");
    expect(range.days).toHaveLength(1);
    expect(range.days[0].toISOString().slice(0, 10)).toBe("2026-09-03");
  });
});

describe("selectWeekRange", () => {
  it("spans Monday through Sunday for a mid-week reference day", () => {
    // 2026-09-03 is a Thursday.
    const range = selectWeekRange(new Date("2026-09-03T14:00:00Z"));

    expect(range.start.toISOString().slice(0, 10)).toBe("2026-08-31"); // Monday
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-09-06"); // Sunday
    expect(range.days).toHaveLength(7);
    expect(range.days.map((d) => d.toISOString().slice(0, 10))).toEqual([
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ]);
  });

  it("treats a Sunday reference day as the end of its own week, not the start of the next", () => {
    // 2026-09-06 is a Sunday.
    const range = selectWeekRange(new Date("2026-09-06T00:00:00Z"));

    expect(range.start.toISOString().slice(0, 10)).toBe("2026-08-31");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-09-06");
  });

  it("treats a Monday reference day as the start of its own week", () => {
    const range = selectWeekRange(new Date("2026-08-31T00:00:00Z"));

    expect(range.start.toISOString().slice(0, 10)).toBe("2026-08-31");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-09-06");
  });
});

describe("selectMonthRange", () => {
  it("spans the 1st through the last day of the reference day's month", () => {
    const range = selectMonthRange(new Date("2026-09-15T14:00:00Z"));

    expect(range.start.toISOString().slice(0, 10)).toBe("2026-09-01");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-09-30");
    expect(range.days).toHaveLength(30);
  });

  it("handles a 31-day month correctly", () => {
    const range = selectMonthRange(new Date("2026-08-15T14:00:00Z"));

    expect(range.end.toISOString().slice(0, 10)).toBe("2026-08-31");
    expect(range.days).toHaveLength(31);
  });

  it("handles February in a non-leap year correctly", () => {
    const range = selectMonthRange(new Date("2026-02-10T14:00:00Z"));

    expect(range.end.toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(range.days).toHaveLength(28);
  });
});

describe("selectDateRange", () => {
  const referenceDay = new Date("2026-09-03T14:00:00Z");

  it("dispatches to selectDayRange for \"day\"", () => {
    expect(selectDateRange(referenceDay, "day")).toEqual(selectDayRange(referenceDay));
  });

  it("dispatches to selectWeekRange for \"week\"", () => {
    expect(selectDateRange(referenceDay, "week")).toEqual(selectWeekRange(referenceDay));
  });

  it("dispatches to selectMonthRange for \"month\"", () => {
    expect(selectDateRange(referenceDay, "month")).toEqual(selectMonthRange(referenceDay));
  });
});

describe("shiftReferenceDay", () => {
  it("moves a day-mode reference day by one day", () => {
    const shifted = shiftReferenceDay(new Date("2026-09-03T00:00:00Z"), "day", 1);
    expect(shifted.toISOString().slice(0, 10)).toBe("2026-09-04");

    const back = shiftReferenceDay(new Date("2026-09-03T00:00:00Z"), "day", -1);
    expect(back.toISOString().slice(0, 10)).toBe("2026-09-02");
  });

  it("moves a week-mode reference day by seven days", () => {
    const shifted = shiftReferenceDay(new Date("2026-09-03T00:00:00Z"), "week", 1);
    expect(shifted.toISOString().slice(0, 10)).toBe("2026-09-10");

    const back = shiftReferenceDay(new Date("2026-09-03T00:00:00Z"), "week", -1);
    expect(back.toISOString().slice(0, 10)).toBe("2026-08-27");
  });

  it("moves a month-mode reference day to the 1st of the next/previous month", () => {
    const shifted = shiftReferenceDay(new Date("2026-09-15T00:00:00Z"), "month", 1);
    expect(shifted.toISOString().slice(0, 10)).toBe("2026-10-01");

    const back = shiftReferenceDay(new Date("2026-09-15T00:00:00Z"), "month", -1);
    expect(back.toISOString().slice(0, 10)).toBe("2026-08-01");
  });

  it("handles a December -> January month rollover", () => {
    const shifted = shiftReferenceDay(new Date("2026-12-15T00:00:00Z"), "month", 1);
    expect(shifted.toISOString().slice(0, 10)).toBe("2027-01-01");
  });
});
