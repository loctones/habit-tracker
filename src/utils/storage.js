/**
 * Storage utilities for the habit tracker.
 *
 * Handles serialization, deserialization, export, import, and archiving
 * of user data. All persistence goes through these functions — no other
 * module should read or write raw JSON directly.
 *
 * Data shape:
 *   {
 *     version: number,
 *     goals: Goal[],
 *     history: { [weekKey: string]: { [goalId: string]: boolean[] } }
 *   }
 *
 * The _archived namespace inside each week's history object holds data
 * for deleted goals so it is never permanently lost.
 */

/** Current schema version. Increment when the data shape changes. */
const SCHEMA_VERSION = 1;

/** localStorage key for persisting data between sessions. */
export const STORAGE_KEY = 'habit-tracker-data';

/**
 * Serializes goals and history into a JSON string for export or storage.
 *
 * Includes a version field so future versions of the app can detect
 * and migrate older data formats if the schema ever changes.
 *
 * @param {object[]} goals   - Array of goal configuration objects.
 * @param {object}   history - Week-keyed history object.
 * @returns {string} JSON string ready for file export or localStorage.
 */
export function serializeData(goals, history) {
  return JSON.stringify({ version: SCHEMA_VERSION, goals, history });
}

/**
 * Parses a JSON string back into goals and history.
 *
 * Returns safe empty defaults if the input is missing, empty, or
 * malformed — this prevents a corrupt export from crashing the app
 * on import or on first load from localStorage.
 *
 * @param {string} json - JSON string produced by serializeData.
 * @returns {{ goals: object[], history: object }}
 */
export function deserializeData(json) {
  if (!json) return { goals: [], history: {} };
  try {
    const parsed = JSON.parse(json);
    return {
      goals: parsed.goals ?? [],
      history: parsed.history ?? {},
    };
  } catch {
    return { goals: [], history: {} };
  }
}

/**
 * Validates and imports a JSON string from a user-supplied file.
 *
 * Stricter than deserializeData — throws descriptive errors rather
 * than silently falling back to defaults, because a failed import
 * should be visible to the user rather than silently discarded.
 *
 * @param {string} json - JSON string from an exported habit-tracker file.
 * @returns {{ goals: object[], history: object }}
 * @throws {Error} If the JSON is malformed or missing required fields.
 */
export function importFromJSON(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('The file could not be read. Make sure it is a valid habit tracker export.');
  }

  if (!Array.isArray(parsed.goals)) {
    throw new Error('Invalid file: missing goals list.');
  }
  if (typeof parsed.history !== 'object' || parsed.history === null) {
    throw new Error('Invalid file: missing history data.');
  }

  return { goals: parsed.goals, history: parsed.history };
}

/**
 * Archives a deleted goal's tracking data rather than erasing it.
 *
 * For each week in history that contains data for the given goalId,
 * the data is moved into history[week]._archived[goalId]. The goal's
 * active key is removed. Weeks with no data for this goal are unchanged.
 *
 * This ensures that deleting a goal never permanently destroys data —
 * the user can always export and inspect the JSON if they need it back.
 *
 * @param {string} goalId  - The id of the goal being deleted.
 * @param {object} history - The full history object.
 * @returns {object} A new history object with the goal's data archived.
 */
export function archiveGoal(goalId, history) {
  const result = {};

  for (const [weekKey, weekData] of Object.entries(history)) {
    if (weekData[goalId] === undefined) {
      result[weekKey] = { ...weekData };
      continue;
    }

    const { [goalId]: goalData, ...rest } = weekData;
    result[weekKey] = {
      ...rest,
      _archived: {
        ...(weekData._archived ?? {}),
        [goalId]: goalData,
      },
    };
  }

  return result;
}

/**
 * Loads persisted data from localStorage.
 *
 * Returns empty defaults if nothing has been saved yet, treating
 * a first-time user the same as one who has cleared their storage.
 *
 * @returns {{ goals: object[], history: object }}
 */
export function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return deserializeData(raw);
}

/**
 * Persists goals and history to localStorage.
 *
 * Called any time goals or history changes so the app survives
 * page reloads without requiring the user to do anything.
 *
 * @param {object[]} goals   - Array of goal configuration objects.
 * @param {object}   history - Week-keyed history object.
 */
export function saveToStorage(goals, history) {
  localStorage.setItem(STORAGE_KEY, serializeData(goals, history));
}
