// Pure date math for the calendar's day/week/month view modes. UTC
// throughout, matching selectors.ts's own isSameUtcDay convention -- "day"
// always means a UTC calendar date here, regardless of what timezone this
// runs in, same reasoning as selectItemsOnDay.
export type TDateRange = {
  start: Date;
  end: Date;
  // One entry per UTC calendar day in [start, end], inclusive.
  days: Date[];
};

const utcDayStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const addUtcDays = (date: Date, count: number): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + count));

const daysBetween = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  for (let cursor = start; cursor <= end; cursor = addUtcDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
};

export const selectDayRange = (referenceDay: Date): TDateRange => {
  const start = utcDayStart(referenceDay);
  return { start, end: start, days: [start] };
};

// Monday-start (ISO 8601) week -- getUTCDay()'s Sunday-is-0 numbering is
// remapped to 7 so a Sunday reference day lands at the *end* of its own
// week rather than the start of the next one.
export const selectWeekRange = (referenceDay: Date): TDateRange => {
  const day = utcDayStart(referenceDay);
  const isoWeekday = day.getUTCDay() === 0 ? 7 : day.getUTCDay();
  const start = addUtcDays(day, -(isoWeekday - 1));
  const end = addUtcDays(start, 6);
  return { start, end, days: daysBetween(start, end) };
};

export const selectMonthRange = (referenceDay: Date): TDateRange => {
  const start = new Date(Date.UTC(referenceDay.getUTCFullYear(), referenceDay.getUTCMonth(), 1));
  // Day 0 of next month is the last day of this one.
  const end = new Date(Date.UTC(referenceDay.getUTCFullYear(), referenceDay.getUTCMonth() + 1, 0));
  return { start, end, days: daysBetween(start, end) };
};
