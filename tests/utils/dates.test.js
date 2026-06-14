import { describe, it, expect } from 'vitest';
import {
  getMonday,
  weekKey,
  formatWeekLabel,
  getDayIndex,
  getWeekDates,
} from '../../src/utils/dates.js';

/**
 * Tests for date utility functions.
 *
 * Weeks run Monday–Sunday. All functions treat Monday as day 0
 * and Sunday as day 6, matching the tracker's display order.
 */
describe('getMonday', () => {
  it('returns the same date when given a Monday', () => {
    const monday = new Date('2026-06-08T12:00:00');
    expect(getMonday(monday).toISOString().slice(0, 10)).toBe('2026-06-08');
  });

  it('returns the previous Monday when given a Wednesday', () => {
    const wednesday = new Date('2026-06-10T12:00:00');
    expect(getMonday(wednesday).toISOString().slice(0, 10)).toBe('2026-06-08');
  });

  it('returns the previous Monday when given a Sunday', () => {
    const sunday = new Date('2026-06-14T12:00:00');
    expect(getMonday(sunday).toISOString().slice(0, 10)).toBe('2026-06-08');
  });

  it('returns midnight on the Monday (time zeroed)', () => {
    const date = new Date('2026-06-10T15:30:00');
    const result = getMonday(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('weekKey', () => {
  it('returns an ISO date string for the given Monday', () => {
    const monday = new Date('2026-06-08T00:00:00');
    expect(weekKey(monday)).toBe('2026-06-08');
  });
});

describe('formatWeekLabel', () => {
  it('formats a week as "Mon D – Mon D"', () => {
    const monday = new Date('2026-06-08T00:00:00');
    expect(formatWeekLabel(monday)).toBe('Jun 8 – Jun 14');
  });

  it('spans months correctly when a week crosses a month boundary', () => {
    const monday = new Date('2026-06-29T00:00:00');
    expect(formatWeekLabel(monday)).toBe('Jun 29 – Jul 5');
  });
});

describe('getDayIndex', () => {
  it('returns 0 for Monday', () => {
    expect(getDayIndex(new Date('2026-06-08'))).toBe(0);
  });

  it('returns 6 for Sunday', () => {
    expect(getDayIndex(new Date('2026-06-14'))).toBe(6);
  });

  it('returns 4 for Friday', () => {
    expect(getDayIndex(new Date('2026-06-12'))).toBe(4);
  });
});

describe('getWeekDates', () => {
  it('returns 7 dates starting from the given Monday', () => {
    const monday = new Date('2026-06-08T00:00:00');
    const dates = getWeekDates(monday);
    expect(dates).toHaveLength(7);
    expect(dates[0].toISOString().slice(0, 10)).toBe('2026-06-08');
    expect(dates[6].toISOString().slice(0, 10)).toBe('2026-06-14');
  });
});
