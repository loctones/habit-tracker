import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appReducer, initialState, ACTION } from '../../src/store/appStore.js';
import { createGoal } from '../../src/utils/goals.js';

/**
 * Tests for the central app reducer.
 *
 * The reducer is a pure function — given a state and an action it returns
 * a new state without side effects. Tests verify state shape correctness
 * and that no action mutates the previous state object.
 */

const makeGoal = (overrides = {}) =>
  createGoal({ name: 'Exercise', target: 6, color: '#78dce8', ...overrides });

describe('initialState', () => {
  it('has an empty goals array', () => {
    expect(initialState.goals).toEqual([]);
  });

  it('has an empty history object', () => {
    expect(initialState.history).toEqual({});
  });

  it('starts with setup screen visible', () => {
    expect(initialState.screen).toBe('setup');
  });

  it('has no active week set', () => {
    expect(initialState.activeWeekKey).toBeNull();
  });
});

describe('ACTION.LOAD_DATA', () => {
  it('replaces goals and history from persisted data', () => {
    const goals = [makeGoal()];
    const history = { '2026-06-08': { [goals[0].id]: [true, false, false, false, false, false, false] } };
    const state = appReducer(initialState, {
      type: ACTION.LOAD_DATA,
      payload: { goals, history },
    });
    expect(state.goals).toEqual(goals);
    expect(state.history).toEqual(history);
  });

  it('switches to tracker screen when goals exist', () => {
    const goals = [makeGoal()];
    const state = appReducer(initialState, {
      type: ACTION.LOAD_DATA,
      payload: { goals, history: {} },
    });
    expect(state.screen).toBe('tracker');
  });

  it('stays on setup screen when no goals are loaded', () => {
    const state = appReducer(initialState, {
      type: ACTION.LOAD_DATA,
      payload: { goals: [], history: {} },
    });
    expect(state.screen).toBe('setup');
  });
});

describe('ACTION.ADD_GOAL', () => {
  it('appends a goal to the list', () => {
    const goal = makeGoal();
    const state = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: goal });
    expect(state.goals).toHaveLength(1);
    expect(state.goals[0]).toEqual(goal);
  });

  it('does not mutate the previous state', () => {
    const goal = makeGoal();
    const prev = { ...initialState, goals: [] };
    appReducer(prev, { type: ACTION.ADD_GOAL, payload: goal });
    expect(prev.goals).toHaveLength(0);
  });

  it('switches to tracker screen after first goal is added', () => {
    const goal = makeGoal();
    const state = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: goal });
    expect(state.screen).toBe('tracker');
  });
});

describe('ACTION.UPDATE_GOAL', () => {
  it('updates a goal by id', () => {
    const goal = makeGoal();
    const withGoal = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: goal });
    const state = appReducer(withGoal, {
      type: ACTION.UPDATE_GOAL,
      payload: { ...goal, name: 'Running' },
    });
    expect(state.goals[0].name).toBe('Running');
  });

  it('leaves other goals unchanged', () => {
    const g1 = makeGoal({ name: 'A' });
    const g2 = makeGoal({ name: 'B' });
    let state = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: g1 });
    state = appReducer(state, { type: ACTION.ADD_GOAL, payload: g2 });
    state = appReducer(state, { type: ACTION.UPDATE_GOAL, payload: { ...g1, name: 'A2' } });
    expect(state.goals[1].name).toBe('B');
  });
});

describe('ACTION.DELETE_GOAL', () => {
  it('removes the goal from the list', () => {
    const goal = makeGoal();
    let state = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: goal });
    state = appReducer(state, { type: ACTION.DELETE_GOAL, payload: goal.id });
    expect(state.goals).toHaveLength(0);
  });

  it('archives the goal history rather than deleting it', () => {
    const goal = makeGoal();
    const history = { '2026-06-08': { [goal.id]: [true, false, false, false, false, false, false] } };
    let state = { ...initialState, goals: [goal], history };
    state = appReducer(state, { type: ACTION.DELETE_GOAL, payload: goal.id });
    expect(state.history['2026-06-08']._archived?.[goal.id]).toBeDefined();
  });

  it('switches to setup screen when last goal is deleted', () => {
    const goal = makeGoal();
    let state = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: goal });
    state = appReducer(state, { type: ACTION.DELETE_GOAL, payload: goal.id });
    expect(state.screen).toBe('setup');
  });
});

describe('ACTION.REORDER_GOALS', () => {
  it('moves a goal from one position to another', () => {
    const g1 = makeGoal({ name: 'A' });
    const g2 = makeGoal({ name: 'B' });
    let state = appReducer(initialState, { type: ACTION.ADD_GOAL, payload: g1 });
    state = appReducer(state, { type: ACTION.ADD_GOAL, payload: g2 });
    state = appReducer(state, {
      type: ACTION.REORDER_GOALS,
      payload: { fromIndex: 0, toIndex: 1 },
    });
    expect(state.goals[0].name).toBe('B');
    expect(state.goals[1].name).toBe('A');
  });
});

describe('ACTION.TOGGLE_DAY', () => {
  it('sets a day to true when it was false', () => {
    const goal = makeGoal();
    const weekKey = '2026-06-08';
    let state = { ...initialState, goals: [goal] };
    state = appReducer(state, {
      type: ACTION.TOGGLE_DAY,
      payload: { goalId: goal.id, weekKey, dayIndex: 0 },
    });
    expect(state.history[weekKey][goal.id][0]).toBe(true);
  });

  it('toggles a day back to false when it was true', () => {
    const goal = makeGoal();
    const weekKey = '2026-06-08';
    const history = { [weekKey]: { [goal.id]: [true, false, false, false, false, false, false] } };
    let state = { ...initialState, goals: [goal], history };
    state = appReducer(state, {
      type: ACTION.TOGGLE_DAY,
      payload: { goalId: goal.id, weekKey, dayIndex: 0 },
    });
    expect(state.history[weekKey][goal.id][0]).toBe(false);
  });

  it('initializes a full 7-day array when the week has no data yet', () => {
    const goal = makeGoal();
    const weekKey = '2026-06-08';
    let state = { ...initialState, goals: [goal] };
    state = appReducer(state, {
      type: ACTION.TOGGLE_DAY,
      payload: { goalId: goal.id, weekKey, dayIndex: 3 },
    });
    expect(state.history[weekKey][goal.id]).toHaveLength(7);
    expect(state.history[weekKey][goal.id][3]).toBe(true);
  });
});

describe('ACTION.NAVIGATE', () => {
  it('sets the active screen', () => {
    const state = appReducer(initialState, {
      type: ACTION.NAVIGATE,
      payload: 'settings',
    });
    expect(state.screen).toBe('settings');
  });
});

describe('ACTION.SET_WEEK', () => {
  it('sets the active week key', () => {
    const state = appReducer(initialState, {
      type: ACTION.SET_WEEK,
      payload: '2026-06-08',
    });
    expect(state.activeWeekKey).toBe('2026-06-08');
  });
});

describe('ACTION.IMPORT_DATA', () => {
  it('replaces all goals and history with imported data', () => {
    const goals = [makeGoal({ name: 'Imported' })];
    const history = {};
    const state = appReducer(initialState, {
      type: ACTION.IMPORT_DATA,
      payload: { goals, history },
    });
    expect(state.goals[0].name).toBe('Imported');
    expect(state.screen).toBe('tracker');
  });
});
