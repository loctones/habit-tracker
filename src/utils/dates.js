/**
 * Date utility functions for the habit tracker.
 *
 * All week-related logic in this app treats Monday as the first day
 * of the week (index 0) and Sunday as the last (index 6). This file
 * is the single source of truth for that convention — no other module
 * should perform raw date arithmetic.
 */

/**
 * Returns the Monday that starts the week containing the given date.
 *
 * JavaScript's getDay() returns 0 for Sunday and 1–6 for Mon–Sat.
 * We normalize Sunday (0) to 7 so the arithmetic works uniformly,
 * then subtract (day - 1) to land on Monday. Time is zeroed so
 * comparisons and key generation are stable regardless of input time.
 *
 * @param {Date} date - Any date within the desired week.
 * @returns {Date} Midnight on the Monday of that week.
 */
export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns a stable string key for a given Monday date.
 *
 * The key is the ISO 8601 date portion (YYYY-MM-DD), which sorts
 * lexicographically in chronological order. Used as the key in the
 * history data store so weeks can be looked up and sorted cheaply.
 *
 * @param {Date} monday - The Monday date for the week.
 * @returns {string} e.g. "2026-06-08"
 */
export function weekKey(monday) {
  return monday.toISOString().slice(0, 10);
}

/**
 * Formats a week range as a human-readable label.
 *
 * Produces "Mon D – Mon D" format (e.g. "Jun 8 – Jun 14").
 * Month names are included on both ends even when the week stays
 * within one month, for consistency. When the week crosses a month
 * boundary both months are shown correctly.
 *
 * @param {Date} monday - The Monday that starts the week.
 * @returns {string} e.g. "Jun 8 – Jun 14" or "Jun 29 – Jul 5"
 */
export function formatWeekLabel(monday) {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  const start = monday.toLocaleDateString('en-US', opts);
  const end = sunday.toLocaleDateString('en-US', opts);
  return `${start} – ${end}`;
}

/**
 * Returns the 0-based index of a date within its week (Mon=0, Sun=6).
 *
 * Used to highlight today's column in the day-toggle grid and to
 * determine which slot to update when the user checks off a day.
 *
 * @param {Date} date - Any date.
 * @returns {number} 0 (Monday) through 6 (Sunday).
 */
export function getDayIndex(date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Returns an array of 7 Date objects representing each day of the week.
 *
 * The array runs Monday (index 0) through Sunday (index 6). Each
 * date is set to midnight local time. Useful for rendering day
 * column headers with their actual calendar dates.
 *
 * @param {Date} monday - The Monday that starts the week.
 * @returns {Date[]} Array of 7 dates.
 */
export function getWeekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}
