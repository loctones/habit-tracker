import { describe, it, expect } from 'vitest';
import {
  createGoal,
  reorderGoals,
  updateGoal,
  MONOKAI_COLORS,
  DEFAULT_COLOR_SEQUENCE,
  nextDefaultColor,
} from '../../src/utils/goals.js';

/**
 * Tests for goal management utility functions.
 *
 * Goals are plain objects — no classes or reactive state. All
 * mutations return new objects so the store can treat them as
 * immutable and React re-renders correctly.
 */

describe('createGoal', () => {
  it('creates a goal with the provided name and target', () => {
    const goal = createGoal({ name: 'Exercise', target: 6 });
    expect(goal.name).toBe('Exercise');
    expect(goal.target).toBe(6);
  });

  it('assigns a unique id to each goal', () => {
    const a = createGoal({ name: 'A', target: 5 });
    const b = createGoal({ name: 'B', target: 5 });
    expect(a.id).toBeDefined();
    expect(b.id).toBeDefined();
    expect(a.id).not.toBe(b.id);
  });

  it('accepts an optional emoji', () => {
    const goal = createGoal({ name: 'Exercise', target: 6, emoji: '🏃' });
    expect(goal.emoji).toBe('🏃');
  });

  it('sets emoji to null when not provided', () => {
    const goal = createGoal({ name: 'Exercise', target: 6 });
    expect(goal.emoji).toBeNull();
  });

  it('accepts a color from the Monokai palette', () => {
    const goal = createGoal({ name: 'Exercise', target: 6, color: '#78dce8' });
    expect(goal.color).toBe('#78dce8');
  });
});

describe('updateGoal', () => {
  it('returns a new goal object with updated fields', () => {
    const goal = createGoal({ name: 'Exercise', target: 6 });
    const updated = updateGoal(goal, { name: 'Running', target: 7 });
    expect(updated.name).toBe('Running');
    expect(updated.target).toBe(7);
  });

  it('preserves the original id', () => {
    const goal = createGoal({ name: 'Exercise', target: 6 });
    const updated = updateGoal(goal, { name: 'Running' });
    expect(updated.id).toBe(goal.id);
  });

  it('does not mutate the original goal', () => {
    const goal = createGoal({ name: 'Exercise', target: 6 });
    updateGoal(goal, { name: 'Running' });
    expect(goal.name).toBe('Exercise');
  });
});

describe('reorderGoals', () => {
  it('moves a goal from one index to another', () => {
    const goals = [
      createGoal({ name: 'A', target: 5 }),
      createGoal({ name: 'B', target: 5 }),
      createGoal({ name: 'C', target: 5 }),
    ];
    const reordered = reorderGoals(goals, 0, 2);
    expect(reordered[0].name).toBe('B');
    expect(reordered[1].name).toBe('C');
    expect(reordered[2].name).toBe('A');
  });

  it('returns a new array without mutating the original', () => {
    const goals = [
      createGoal({ name: 'A', target: 5 }),
      createGoal({ name: 'B', target: 5 }),
    ];
    const reordered = reorderGoals(goals, 0, 1);
    expect(goals[0].name).toBe('A');
    expect(reordered[0].name).toBe('B');
  });
});

describe('MONOKAI_COLORS', () => {
  it('contains the expected Monokai Pro palette entries', () => {
    expect(MONOKAI_COLORS).toContainEqual(
      expect.objectContaining({ hex: '#78dce8', name: 'Cyan' })
    );
    expect(MONOKAI_COLORS).toContainEqual(
      expect.objectContaining({ hex: '#a9dc76', name: 'Green' })
    );
  });
});

describe('nextDefaultColor', () => {
  it('returns the first color when no goals exist', () => {
    expect(nextDefaultColor([])).toBe(DEFAULT_COLOR_SEQUENCE[0]);
  });

  it('returns the next color in sequence based on existing goal count', () => {
    const goals = [
      createGoal({ name: 'A', target: 5, color: DEFAULT_COLOR_SEQUENCE[0] }),
    ];
    expect(nextDefaultColor(goals)).toBe(DEFAULT_COLOR_SEQUENCE[1]);
  });

  it('wraps around when all colors have been used', () => {
    const goals = DEFAULT_COLOR_SEQUENCE.map((color, i) =>
      createGoal({ name: `Goal ${i}`, target: 5, color })
    );
    expect(nextDefaultColor(goals)).toBe(DEFAULT_COLOR_SEQUENCE[0]);
  });
});
