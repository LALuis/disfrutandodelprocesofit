import {
  addDays,
  dateRange,
  formatDateShort,
  isIsoDate,
  isTime,
  parseIsoDate,
  toEpoch,
  toIsoDate,
  weekdayOf,
} from './dates';

describe('date utilities', () => {
  it('round-trips ISO dates in local time', () => {
    expect(toIsoDate(parseIsoDate('2026-09-13'))).toBe('2026-09-13');
    expect(parseIsoDate('2026-09-13').getDate()).toBe(13);
  });

  it('validates ISO dates and times strictly', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-2-8')).toBe(false);
    expect(isIsoDate('13/09/2026')).toBe(false);
    expect(isTime('08:00')).toBe(true);
    expect(isTime('24:00')).toBe(false);
    expect(isTime('8:00')).toBe(false);
  });

  it('computes epoch millis for a local date + time', () => {
    const epoch = toEpoch('2026-09-13', '18:30');
    const date = new Date(epoch);
    expect(date.getHours()).toBe(18);
    expect(date.getMinutes()).toBe(30);
    expect(Number.isNaN(toEpoch('bad', '18:30'))).toBe(true);
    expect(Number.isNaN(toEpoch('2026-09-13', 'bad'))).toBe(true);
  });

  it('adds days across month boundaries and finds weekdays', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(weekdayOf('2026-09-13')).toBe(0); // Sunday
    expect(weekdayOf('2026-09-14')).toBe(1); // Monday
  });

  it('builds inclusive date ranges', () => {
    expect(dateRange('2026-09-13', '2026-09-15')).toEqual([
      '2026-09-13',
      '2026-09-14',
      '2026-09-15',
    ]);
    expect(dateRange('2026-09-15', '2026-09-13')).toEqual([]);
  });

  it('formats dates for Uruguay', () => {
    expect(formatDateShort('2026-09-13')).toBe('13/09/2026');
    expect(formatDateShort('not-a-date')).toBe('not-a-date');
  });
});
