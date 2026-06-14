import { C, T } from '../styles/theme.js';

/**
 * BulletBar — a horizontal progress bar with a target line marker.
 *
 * Renders the user's weekly progress for a single goal. The fill
 * color is the goal's own Monokai color when progress is below target,
 * and switches to green when the target is met or exceeded.
 *
 * The target line is an absolutely-positioned vertical rule that sits
 * at the proportional position for the target value. It is taller than
 * the bar itself so it is clearly visible even at low fill levels.
 *
 * @param {{
 *   done:   number,  // days completed so far this week
 *   total:  number,  // total days in the week (always 7)
 *   target: number,  // the user's goal for the week
 *   color:  string,  // hex color for the fill (from Monokai palette)
 * }} props
 */
export default function BulletBar({ done, total, target, color }) {
  const fillPct   = (done / total) * 100;
  const targetPct = (target / total) * 100;
  const met       = done >= target;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: T.space.xs }}>
      {/* Bar track */}
      <div
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${done} of ${target} days completed`}
        style={{
          position: 'relative',
          height: 18,
          background: C.overlay,
          borderRadius: T.radius.sm,
          overflow: 'visible',
        }}
      >
        {/* Progress fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${fillPct}%`,
            background: met ? C.green : color,
            borderRadius: T.radius.sm,
            transition: 'width 0.3s ease',
          }}
        />

        {/* Target line — extends above and below the bar for visibility */}
        <div
          data-testid="target-line"
          style={{
            position: 'absolute',
            left: `${targetPct}%`,
            top: -4,
            bottom: -4,
            width: 2,
            background: C.yellow,
            borderRadius: 1,
            zIndex: 2,
          }}
        />
      </div>

      {/* Axis labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: T.fontSize.xs,
        color: C.muted,
        position: 'relative',
      }}>
        <span>0</span>
        <span style={{
          position: 'absolute',
          left: `${targetPct}%`,
          transform: 'translateX(-50%)',
          color: C.yellow,
          whiteSpace: 'nowrap',
        }}>
          target {target}
        </span>
        <span>7</span>
      </div>
    </div>
  );
}
