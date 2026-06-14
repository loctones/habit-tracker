import { useState } from 'react';
import { createGoal, MONOKAI_COLORS, nextDefaultColor } from '../utils/goals.js';
import { C, T } from '../styles/theme.js';

/**
 * SetupWizard — onboards a new user by collecting their first goal.
 *
 * Shown whenever the user has no goals configured (initial launch or
 * after deleting their last goal). Collects name, optional emoji,
 * target days per week, and a color from the Monokai palette.
 *
 * Validation runs on submit rather than on each keystroke to avoid
 * interrupting the user while they are still typing.
 *
 * @param {{ onComplete: (goal: object) => void, existingGoals?: object[] }} props
 *   onComplete    — called with a fully-formed goal object on valid submit
 *   existingGoals — used to auto-assign the next color in the sequence
 */
export default function SetupWizard({ onComplete, existingGoals = [] }) {
  const [name, setName]       = useState('');
  const [emoji, setEmoji]     = useState('');
  const [emojiSkipped, setEmojiSkipped] = useState(false);
  const [target, setTarget]   = useState(6);
  const [color, setColor]     = useState(() => nextDefaultColor(existingGoals));
  const [errors, setErrors]   = useState({});

  /**
   * Validates the form fields and returns an error map.
   * An empty object means the form is valid.
   */
  function validate() {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!target || Number(target) < 1 || Number(target) > 7)
      e.target = 'Target must be between 1 and 7';
    return e;
  }

  /**
   * Handles form submission. Validates, then calls onComplete with
   * a new goal object if everything is in order.
   */
  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const goal = createGoal({
      name:   name.trim(),
      emoji:  emojiSkipped || !emoji.trim() ? null : emoji.trim(),
      target: Number(target),
      color,
    });

    onComplete(goal);
  }

  const inputStyle = {
    width: '100%',
    background: C.surface,
    border: `1.5px solid ${C.overlay}`,
    borderRadius: T.radius.sm,
    color: C.text,
    fontSize: T.fontSize.sm,
    padding: '10px 12px',
    fontFamily: T.fontFamily,
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: T.fontSize.xs,
    color: C.subtle,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: T.space.xs,
  };

  const errorStyle = {
    fontSize: T.fontSize.xs,
    color: C.red,
    marginTop: T.space.xs,
  };

  return (
    <div style={{
      fontFamily: T.fontFamily,
      background: C.bg,
      minHeight: '100vh',
      padding: `${T.space.xxl}px ${T.space.lg}px`,
      color: C.text,
      maxWidth: 480,
      margin: '0 auto',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ marginBottom: T.space.xl }}>
        <div style={{ fontSize: T.fontSize.xs, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: T.space.xs }}>
          Habit Tracker
        </div>
        <h1 style={{ fontSize: T.fontSize.xl, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: C.text }}>
          Welcome
        </h1>
        <p style={{ fontSize: T.fontSize.sm, color: C.subtle, marginTop: T.space.sm, lineHeight: 1.5 }}>
          Let's set up your first goal. You can add more later from settings.
        </p>
      </div>

      {/* Goal Name */}
      <div style={{ marginBottom: T.space.lg }}>
        <label style={labelStyle}>Goal Name</label>
        <input
          style={{ ...inputStyle, borderColor: errors.name ? C.red : C.overlay }}
          placeholder="Goal name"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
        />
        {errors.name && <div style={errorStyle}>{errors.name}</div>}
      </div>

      {/* Emoji */}
      <div style={{ marginBottom: T.space.lg }}>
        <label style={labelStyle}>Emoji <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <div style={{ display: 'flex', gap: T.space.sm, alignItems: 'center' }}>
          <input
            style={{ ...inputStyle, width: 80, opacity: emojiSkipped ? 0.35 : 1 }}
            placeholder="Emoji"
            value={emoji}
            disabled={emojiSkipped}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={2}
          />
          <button
            onClick={() => { setEmojiSkipped((v) => !v); setEmoji(''); }}
            style={{
              fontSize: T.fontSize.xs,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '8px 14px',
              background: emojiSkipped ? C.surface : 'transparent',
              border: `1.5px solid ${emojiSkipped ? C.cyan : C.overlay}`,
              borderRadius: T.radius.sm,
              cursor: 'pointer',
              color: emojiSkipped ? C.cyan : C.subtle,
              fontFamily: T.fontFamily,
              whiteSpace: 'nowrap',
            }}
          >
            {emojiSkipped ? 'Skipped' : 'Skip'}
          </button>
        </div>
      </div>

      {/* Target */}
      <div style={{ marginBottom: T.space.lg }}>
        <label htmlFor="target-input" style={labelStyle}>Days per week</label>
        <input
          id="target-input"
          type="number"
          min={1}
          max={7}
          style={{ ...inputStyle, width: 80, borderColor: errors.target ? C.red : C.overlay }}
          value={target}
          onChange={(e) => { setTarget(e.target.value); setErrors((prev) => ({ ...prev, target: undefined })); }}
          aria-label="Days per week"
        />
        {errors.target && <div style={errorStyle}>{errors.target}</div>}
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: T.space.xl }}>
        <label style={labelStyle}>Color</label>
        <div style={{ display: 'flex', gap: T.space.sm, flexWrap: 'wrap' }}>
          {MONOKAI_COLORS.map((c) => (
            <button
              key={c.hex}
              aria-label={`color ${c.name}`}
              onClick={() => setColor(c.hex)}
              style={{
                width: 36,
                height: 36,
                borderRadius: T.radius.md,
                background: c.hex,
                border: color === c.hex ? `3px solid ${C.text}` : `3px solid transparent`,
                cursor: 'pointer',
                padding: 0,
                transition: 'border 0.15s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        aria-label="Add goal"
        style={{
          width: '100%',
          padding: '14px',
          background: color,
          border: 'none',
          borderRadius: T.radius.sm,
          color: C.bg,
          fontSize: T.fontSize.sm,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: T.fontFamily,
          letterSpacing: '0.04em',
        }}
      >
        Add Goal
      </button>
    </div>
  );
}
