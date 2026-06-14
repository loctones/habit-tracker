/**
 * Central application state store for the habit tracker.
 *
 * Uses a single useReducer-compatible reducer so all state transitions
 * are explicit, testable, and traceable. No state is modified in place —
 * every action returns a fresh state object.
 *
 * Screens:
 *   'setup'    — shown when the user has no goals configured yet
 *   'tracker'  — the main weekly tracking view
 *   'settings' — goal management (add, edit, delete, reorder)
 *
 * State shape:
 *   {
 *     goals:         Goal[],
 *     history:       { [weekKey: string]: { [goalId: string]: boolean[] } },
 *     screen:        'setup' | 'tracker' | 'settings',
 *     activeWeekKey: string | null,
 *   }
 */

import { archiveGoal } from '../utils/storage.js';
import { reorderGoals } from '../utils/goals.js';

/**
 * All valid action type strings.
 *
 * Centralizing them as constants prevents typo-driven bugs and makes
 * it easy to find every dispatch site for a given action via search.
 */
export const ACTION = {
  LOAD_DATA:     'LOAD_DATA',
  ADD_GOAL:      'ADD_GOAL',
  UPDATE_GOAL:   'UPDATE_GOAL',
  DELETE_GOAL:   'DELETE_GOAL',
  REORDER_GOALS: 'REORDER_GOALS',
  TOGGLE_DAY:    'TOGGLE_DAY',
  NAVIGATE:      'NAVIGATE',
  SET_WEEK:      'SET_WEEK',
  IMPORT_DATA:   'IMPORT_DATA',
};

/**
 * The state used before any persisted data has been loaded.
 *
 * Screen starts as 'setup' so first-time users see the wizard.
 * activeWeekKey is null until the tracker screen sets it to today's week.
 */
export const initialState = {
  goals:         [],
  history:       {},
  screen:        'setup',
  activeWeekKey: null,
};

/**
 * Pure reducer for all app state transitions.
 *
 * Each case handles one action type and returns a completely new state
 * object. The default case returns the previous state unchanged so
 * unknown actions are safely ignored rather than crashing.
 *
 * @param {object} state  - Current application state.
 * @param {object} action - Action with a `type` string and optional `payload`.
 * @returns {object} New application state.
 */
export function appReducer(state, action) {
  switch (action.type) {

    /**
     * Restores persisted goals and history on app load.
     * Jumps straight to the tracker if goals exist, otherwise
     * shows the setup wizard.
     */
    case ACTION.LOAD_DATA: {
      const { goals, history } = action.payload;
      return {
        ...state,
        goals,
        history,
        screen: goals.length > 0 ? 'tracker' : 'setup',
      };
    }

    /**
     * Appends a fully-formed goal object (created via createGoal)
     * and moves the user to the tracker screen.
     */
    case ACTION.ADD_GOAL: {
      const goals = [...state.goals, action.payload];
      return {
        ...state,
        goals,
        screen: 'tracker',
      };
    }

    /**
     * Replaces the goal with the same id as the payload.
     * Other goals are untouched.
     */
    case ACTION.UPDATE_GOAL: {
      const goals = state.goals.map((g) =>
        g.id === action.payload.id ? action.payload : g
      );
      return { ...state, goals };
    }

    /**
     * Removes the goal from the active list and archives its history.
     * Navigates back to setup if no goals remain.
     */
    case ACTION.DELETE_GOAL: {
      const goals = state.goals.filter((g) => g.id !== action.payload);
      const history = archiveGoal(action.payload, state.history);
      return {
        ...state,
        goals,
        history,
        screen: goals.length === 0 ? 'setup' : state.screen,
      };
    }

    /**
     * Moves a goal from fromIndex to toIndex in the ordered list.
     * Driven by the drag-and-drop handler in the settings screen.
     */
    case ACTION.REORDER_GOALS: {
      const { fromIndex, toIndex } = action.payload;
      return {
        ...state,
        goals: reorderGoals(state.goals, fromIndex, toIndex),
      };
    }

    /**
     * Flips one day's boolean for a given goal and week.
     *
     * If no history exists for this week yet, initializes a fresh
     * 7-element false array before applying the toggle. This avoids
     * having to seed history when a new week begins.
     */
    case ACTION.TOGGLE_DAY: {
      const { goalId, weekKey, dayIndex } = action.payload;
      const weekData = state.history[weekKey] ?? {};
      const days = weekData[goalId] ?? Array(7).fill(false);
      const updatedDays = days.map((v, i) => (i === dayIndex ? !v : v));
      return {
        ...state,
        history: {
          ...state.history,
          [weekKey]: {
            ...weekData,
            [goalId]: updatedDays,
          },
        },
      };
    }

    /**
     * Navigates to a named screen without changing any data.
     */
    case ACTION.NAVIGATE: {
      return { ...state, screen: action.payload };
    }

    /**
     * Sets the week the tracker is currently displaying.
     * Stored in state so the settings screen can return to the
     * same week the user was viewing.
     */
    case ACTION.SET_WEEK: {
      return { ...state, activeWeekKey: action.payload };
    }

    /**
     * Replaces all app data with an imported JSON payload.
     * Identical to LOAD_DATA but semantically distinct — used
     * when the user explicitly imports a file rather than on boot.
     */
    case ACTION.IMPORT_DATA: {
      const { goals, history } = action.payload;
      return {
        ...state,
        goals,
        history,
        screen: goals.length > 0 ? 'tracker' : 'setup',
      };
    }

    default:
      return state;
  }
}
