import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { C, T } from '../styles/theme.js';
import { MONOKAI_COLORS, createGoal, updateGoal, nextDefaultColor } from '../utils/goals.js';
import { ACTION } from '../store/appStore.js';

/**
 * SortableGoalRow — a single draggable, editable goal row in the settings list.
 *
 * Wraps dnd-kit's useSortable hook so the row can be dragged to reorder.
 * Inline editing is handled via a local edit state toggled by the edit button.
 * Changes are dispatched as UPDATE_GOAL only on save, not on each keystroke.
 *
 * @param {{ goal: object, dispatch: function, onDelete: function }} props
 */
function SortableGoalRow({ goal, dispatch, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: goal.id });

  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState(goal.name);
  const [emoji, setEmoji]         = useState(goal.emoji ?? '');
  const [target, setTarget]       = useState(goal.target);
  const [color, setColor]         = useState(goal.color);
  const [showPicker, setShowPicker] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function saveEdit() {
    dispatch({
      type: ACTION.UPDATE_GOAL,
      payload: updateGoal(goal, {
        name:  name.trim() || goal.name,
        emoji: emoji.trim() || null,
        target: Math.min(7, Math.max(1, Number(target))),
        color,
      }),
    });
    setEditing(false);
    setShowPicker(false);
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.overlay}`,
        borderRadius: T.radius.md,
        padding: `${T.space.sm}px ${T.space.md}px`,
        marginBottom: T.space.sm,
      }}>
        {!editing ? (
          /* View mode */
          <div style={{ display: 'flex', alignItems: 'center', gap: T.space.sm }}>
            {/* Drag handle */}
            <span
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', color: C.muted, fontSize: T.fontSize.md, userSelect: 'none', touchAction: 'none' }}
              title="Drag to reorder"
            >⠿</span>

            {/* Color dot */}
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: goal.color, flexShrink: 0 }} />

            {/* Label */}
            <div style={{ flex: 1, fontSize: T.fontSize.sm, fontWeight: 600 }}>
              {goal.emoji ? `${goal.emoji} ` : ''}{goal.name}
            </div>
            <div style={{ fontSize: T.fontSize.xs, color: C.muted }}>{goal.target}d/wk</div>

            {/* Edit button */}
            <button onClick={() => setEditing(true)} style={iconBtn}>✎</button>

            {/* Delete button */}
            <button onClick={() => onDelete(goal.id)} style={{ ...iconBtn, color: C.red }}>✕</button>
          </div>
        ) : (
          /* Edit mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: T.space.sm }}>
            <div style={{ display: 'flex', gap: T.space.sm }}>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="Emoji"
                maxLength={2}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{ ...editInput, width: 56 }}
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Goal name"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{ ...editInput, flex: 1 }}
              />
              <input
                type="number"
                min={1}
                max={7}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={{ ...editInput, width: 52 }}
              />
            </div>

            {/* Color swatch + picker toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: T.space.sm }}>
              <button
                onClick={() => setShowPicker((v) => !v)}
                style={{
                  width: 28, height: 28,
                  borderRadius: T.radius.sm,
                  background: color,
                  border: `2px solid ${C.text}`,
                  cursor: 'pointer',
                  padding: 0,
                }}
                aria-label="Change color"
              />
              <span style={{ fontSize: T.fontSize.xs, color: C.muted }}>Color</span>
            </div>

            {showPicker && (
              <div style={{ display: 'flex', gap: T.space.xs, flexWrap: 'wrap' }}>
                {MONOKAI_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => { setColor(c.hex); setShowPicker(false); }}
                    aria-label={`color ${c.name}`}
                    style={{
                      width: 30, height: 30,
                      borderRadius: T.radius.sm,
                      background: c.hex,
                      border: color === c.hex ? `3px solid ${C.text}` : `3px solid transparent`,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: T.space.sm, justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditing(false); setShowPicker(false); }} style={secondaryBtn}>Cancel</button>
              <button onClick={saveEdit} style={{ ...secondaryBtn, color: C.green, borderColor: C.green }}>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SettingsScreen — manage goals: add, edit, delete, and reorder via drag.
 *
 * Uses dnd-kit for accessible drag-and-drop reordering. The add goal
 * form is an inline version of the wizard (not a separate screen) since
 * the user has already been onboarded and doesn't need the full intro.
 *
 * @param {{ goals: object[], dispatch: function, onBack: function }} props
 */
export default function SettingsScreen({ goals, dispatch, onBack }) {
  const [showAdd, setShowAdd]   = useState(false);
  const [newName, setNewName]   = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newTarget, setNewTarget] = useState(6);
  const [newColor, setNewColor] = useState(() => nextDefaultColor(goals));
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = goals.findIndex((g) => g.id === active.id);
    const toIndex   = goals.findIndex((g) => g.id === over.id);
    dispatch({ type: ACTION.REORDER_GOALS, payload: { fromIndex, toIndex } });
  }

  function handleAdd() {
    if (!newName.trim()) return;
    const goal = createGoal({
      name:   newName.trim(),
      emoji:  newEmoji.trim() || null,
      target: Math.min(7, Math.max(1, Number(newTarget))),
      color:  newColor,
    });
    dispatch({ type: ACTION.ADD_GOAL, payload: goal });
    setNewName('');
    setNewEmoji('');
    setNewTarget(6);
    setNewColor(nextDefaultColor([...goals, goal]));
    setShowAdd(false);
  }

  function handleDelete(id) {
    if (deleteConfirm === id) {
      dispatch({ type: ACTION.DELETE_GOAL, payload: id });
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  }

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
      <div style={{ display: 'flex', alignItems: 'center', gap: T.space.md, marginBottom: T.space.xl }}>
        <button onClick={onBack} style={{ ...iconBtn, fontSize: T.fontSize.lg }}>←</button>
        <div>
          <div style={{ fontSize: T.fontSize.xs, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase' }}>
            Habit Tracker
          </div>
          <h1 style={{ fontSize: T.fontSize.xl, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Settings
          </h1>
        </div>
      </div>

      {/* Goals section */}
      <div style={{ fontSize: T.fontSize.xs, fontWeight: 600, letterSpacing: '0.12em', color: C.muted, textTransform: 'uppercase', marginBottom: T.space.md }}>
        Goals
      </div>

      {/* Delete confirm banner */}
      {deleteConfirm && (
        <div style={{ background: C.surface, border: `1px solid ${C.red}`, borderRadius: T.radius.md, padding: T.space.md, marginBottom: T.space.md, fontSize: T.fontSize.xs, color: C.red }}>
          Tap ✕ again to confirm deletion. Goal history will be archived.
        </div>
      )}

      {/* Sortable goal list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          {goals.map((goal) => (
            <SortableGoalRow
              key={goal.id}
              goal={goal}
              dispatch={dispatch}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add goal */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: `1.5px dashed ${C.overlay}`,
            borderRadius: T.radius.md,
            color: C.subtle,
            fontSize: T.fontSize.sm,
            cursor: 'pointer',
            fontFamily: T.fontFamily,
            marginTop: T.space.sm,
          }}
        >
          + Add Goal
        </button>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.overlay}`, borderRadius: T.radius.md, padding: T.space.md, marginTop: T.space.sm }}>
          <div style={{ display: 'flex', gap: T.space.sm, marginBottom: T.space.sm }}>
            <input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} placeholder="Emoji" maxLength={2} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" style={{ ...editInput, width: 56 }} />
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Goal name" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" style={{ ...editInput, flex: 1 }} />
            <input type="number" min={1} max={7} value={newTarget} onChange={(e) => setNewTarget(e.target.value)} style={{ ...editInput, width: 52 }} />
          </div>
          <div style={{ display: 'flex', gap: T.space.xs, marginBottom: T.space.sm, flexWrap: 'wrap' }}>
            {MONOKAI_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => setNewColor(c.hex)}
                aria-label={`color ${c.name}`}
                style={{
                  width: 28, height: 28,
                  borderRadius: T.radius.sm,
                  background: c.hex,
                  border: newColor === c.hex ? `3px solid ${C.text}` : `3px solid transparent`,
                  cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: T.space.sm, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} style={secondaryBtn}>Cancel</button>
            <button onClick={handleAdd} style={{ ...secondaryBtn, color: C.green, borderColor: C.green }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: C.subtle,
  fontSize: T.fontSize.sm,
  fontFamily: T.fontFamily,
  padding: 4,
  lineHeight: 1,
};

const editInput = {
  background: C.overlay,
  border: `1.5px solid ${C.muted}`,
  borderRadius: T.radius.sm,
  color: C.text,
  fontSize: T.fontSize.sm,
  padding: '8px 10px',
  fontFamily: T.fontFamily,
  outline: 'none',
};

const secondaryBtn = {
  fontSize: T.fontSize.xs,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '6px 12px',
  background: 'transparent',
  border: `1.5px solid ${C.overlay}`,
  borderRadius: T.radius.sm,
  cursor: 'pointer',
  color: C.subtle,
  fontFamily: T.fontFamily,
};
