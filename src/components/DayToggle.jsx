import { C, T } from '../styles/theme.js';

/**
 * DayToggle — a single toggleable button representing one day of the week.
 *
 * Displays the day's initial letter when unchecked and a checkmark
 * when the user has marked it done. The button for today gets a
 * distinct border so the user knows where they are in the week.
 *
 * The color prop is the goal's Monokai color, used as the border and
 * check color when the day is marked done — tying the check visually
 * to its parent goal.
 *
 * @param {{
 *   dayLabel: string,    // single letter label ("M", "T", etc.)
 *   checked:  boolean,   // whether this day is marked done
 *   onChange: () => void, // called when the button is clicked
 *   isToday:  boolean,   // true when this column is today's date
 *   color:    string,    // goal's hex color for the checked state
 * }} props
 */
export default function DayToggle({ dayLabel, checked, onChange, isToday, color }) {
  return (
    <button
      onClick={onChange}
      data-today={isToday ? 'true' : 'false'}
      aria-pressed={checked}
      aria-label={`${dayLabel}${isToday ? ', today' : ''}`}
      style={{
        width: 34,
        height: 34,
        borderRadius: T.radius.sm,
        border: isToday
          ? `2px solid ${color}`
          : checked
            ? `2px solid ${color}`
            : `1.5px solid ${C.overlay}`,
        background: checked ? C.surface : 'transparent',
        color: checked ? color : C.muted,
        fontSize: T.fontSize.xs,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        fontFamily: T.fontFamily,
        letterSpacing: '0.03em',
        padding: 0,
      }}
    >
      {checked ? '✓' : dayLabel}
    </button>
  );
}
