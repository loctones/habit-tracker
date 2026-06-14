import { useState, useEffect } from 'react';
import { C, T } from '../styles/theme.js';
import BulletBar from './BulletBar.jsx';
import DayToggle from './DayToggle.jsx';
import { getMonday, weekKey, formatWeekLabel, getDayIndex } from '../utils/dates.js';
import { ACTION } from '../store/appStore.js';

/**
 * TrackerScreen — the main weekly tracking view.
 *
 * Displays one week at a time with day toggles and bullet bars for
 * each configured goal. The user navigates between weeks with prev/next
 * buttons and can jump back to the current week at any time.
 *
 * Week data for the current view is read directly from state.history
 * using the active week's key. Toggling a day dispatches TOGGLE_DAY
 * which updates history immutably in the reducer.
 *
 * @param {{
 *   goals:    object[],
 *   history:  object,
 *   dispatch: function,
 *   onSettings: function,
 *   onExport: function,
 *   onImport: function,
 * }} props
 */
export default function TrackerScreen({ goals, history, dispatch, onSettings, onExport, onImport }) {
  const today         = new Date();
  const currentMonday = getMonday(today);
  const currentKey    = weekKey(currentMonday);
  const todayIdx      = getDayIndex(today);

  const [viewMonday, setViewMonday] = useState(currentMonday);
  const vKey          = weekKey(viewMonday);
  const isCurrentWeek = vKey === currentKey;
  const weekData      = history[vKey] ?? {};

  // Keep the store's activeWeekKey in sync with local navigation state
  useEffect(() => {
    dispatch({ type: ACTION.SET_WEEK, payload: vKey });
  }, [vKey]);

  // Past weeks sorted newest-first, excluding the currently viewed week
  const pastKeys = Object.keys(history)
    .filter((k) => k !== vKey && !k.startsWith('_'))
    .sort()
    .reverse();

  function navWeek(dir) {
    setViewMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * 7);
      return d;
    });
  }

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const navBtnStyle = {
    fontSize: T.fontSize.xs,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '6px 12px',
    background: 'transparent',
    border: `1.5px solid ${C.overlay}`,
    borderRadius: T.radius.sm,
    cursor: 'pointer',
    color: C.subtle,
    fontFamily: T.fontFamily,
  };

  return (
    <div style={{
      fontFamily: T.fontFamily,
      background: C.bg,
      minHeight: '100vh',
      padding: `${T.space.xl}px ${T.space.lg}px`,
      color: C.text,
      maxWidth: 560,
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: T.space.xl }}>
        <div>
          <div style={{ fontSize: T.fontSize.xs, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: T.space.xs }}>
            Weekly Tracker
          </div>
          <div style={{ fontSize: T.fontSize.xl, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {formatWeekLabel(viewMonday)}
            {isCurrentWeek && (
              <span style={{ marginLeft: 10, fontSize: T.fontSize.xs, fontWeight: 500, color: C.cyan, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                this week
              </span>
            )}
          </div>
        </div>

        {/* Settings + export/import */}
        <div style={{ display: 'flex', gap: T.space.sm, alignItems: 'center', marginTop: 4 }}>
          <button onClick={onExport} title="Export data" style={{ ...navBtnStyle, padding: '6px 10px' }}>↓</button>
          <label title="Import data" style={{ ...navBtnStyle, padding: '6px 10px', cursor: 'pointer', display: 'inline-block' }}>
            ↑
            <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          </label>
          <button onClick={onSettings} title="Settings" style={{ ...navBtnStyle, padding: '6px 10px', fontSize: T.fontSize.md }}>⚙</button>
        </div>
      </div>

      {/* Week navigation */}
      <div style={{ display: 'flex', gap: T.space.sm, marginBottom: T.space.xl }}>
        <button onClick={() => navWeek(-1)} style={navBtnStyle}>← Prev</button>
        {!isCurrentWeek && (
          <button
            onClick={() => setViewMonday(currentMonday)}
            style={{ ...navBtnStyle, color: C.yellow, borderColor: C.yellow }}
          >
            Today
          </button>
        )}
        <button
          onClick={() => navWeek(1)}
          disabled={isCurrentWeek}
          style={{ ...navBtnStyle, opacity: isCurrentWeek ? 0.25 : 1, cursor: isCurrentWeek ? 'default' : 'pointer' }}
        >
          Next →
        </button>
      </div>

      {/* Goals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: T.space.xl }}>
        {goals.map((goal) => {
          const days = weekData[goal.id] ?? Array(7).fill(false);
          const done = days.filter(Boolean).length;
          const met  = done >= goal.target;

          return (
            <div key={goal.id}>
              {/* Goal label row */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: T.space.sm }}>
                <div style={{ fontSize: T.fontSize.sm, fontWeight: 600, letterSpacing: '0.01em' }}>
                  {goal.emoji && <span style={{ marginRight: 6 }}>{goal.emoji}</span>}
                  {goal.name}
                </div>
                <div style={{ fontSize: T.fontSize.xs, color: met ? C.green : C.muted, fontWeight: met ? 700 : 400 }}>
                  {done}/{goal.target}{met && ' ✓'}
                </div>
              </div>

              {/* Day toggles */}
              <div style={{ display: 'flex', gap: 6, marginBottom: T.space.sm }}>
                {DAYS.map((d, i) => (
                  <DayToggle
                    key={i}
                    dayLabel={d}
                    checked={days[i] ?? false}
                    isToday={isCurrentWeek && i === todayIdx}
                    color={goal.color}
                    onChange={() => dispatch({
                      type: ACTION.TOGGLE_DAY,
                      payload: { goalId: goal.id, weekKey: vKey, dayIndex: i },
                    })}
                  />
                ))}
              </div>

              {/* Bullet bar */}
              <BulletBar done={done} total={7} target={goal.target} color={goal.color} />
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.overlay}`, margin: `${T.space.xl}px 0 ${T.space.lg}px` }} />

      {/* History */}
      <div>
        <div style={{ fontSize: T.fontSize.xs, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: T.space.md }}>
          Past Weeks
        </div>

        {pastKeys.length === 0 ? (
          <div style={{ fontSize: T.fontSize.sm, color: C.muted, fontStyle: 'italic' }}>
            No history yet. Check off some days to get started.
          </div>
        ) : (
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: T.space.sm }}>
            {pastKeys.map((k) => {
              const mon   = new Date(k + 'T00:00:00');
              const wData = history[k] ?? {};
              return (
                <div
                  key={k}
                  onClick={() => setViewMonday(mon)}
                  style={{
                    background: C.surface,
                    borderRadius: T.radius.md,
                    padding: `${T.space.sm}px ${T.space.md}px`,
                    cursor: 'pointer',
                    border: `1px solid ${C.overlay}`,
                  }}
                >
                  <div style={{ fontSize: T.fontSize.xs, color: C.muted, marginBottom: T.space.sm, fontWeight: 500 }}>
                    {formatWeekLabel(mon)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {goals.map((goal) => {
                      const days      = wData[goal.id] ?? Array(7).fill(false);
                      const done      = days.filter(Boolean).length;
                      const met       = done >= goal.target;
                      const fillPct   = (done / 7) * 100;
                      const targetPct = (goal.target / 7) * 100;
                      return (
                        <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: T.space.sm }}>
                          <div style={{ fontSize: T.fontSize.xs, width: 90, color: C.subtle, fontWeight: 500, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {goal.emoji ? `${goal.emoji} ` : ''}{goal.name}
                          </div>
                          <div style={{ flex: 1, position: 'relative', height: 8, background: C.overlay, borderRadius: 1, overflow: 'visible' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${fillPct}%`, background: met ? C.green : goal.color, borderRadius: 1 }} />
                            <div style={{ position: 'absolute', left: `${targetPct}%`, top: -2, bottom: -2, width: 1.5, background: C.yellow, zIndex: 2 }} />
                          </div>
                          <div style={{ fontSize: T.fontSize.xs, width: 40, textAlign: 'right', color: met ? C.green : C.muted, fontWeight: met ? 700 : 400, flexShrink: 0 }}>
                            {done}/{goal.target}{met ? ' ✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
