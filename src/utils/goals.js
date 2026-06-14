/**
 * Goal management utilities for the habit tracker.
 *
 * Goals are plain immutable objects. All functions that modify a goal
 * return a new object rather than mutating in place, keeping the store's
 * state updates predictable and React re-renders correct.
 *
 * Goal shape:
 *   {
 *     id:     string,   // stable unique identifier (crypto UUID)
 *     name:   string,   // display name entered by the user
 *     emoji:  string|null, // optional emoji prefix
 *     target: number,   // days per week the user aims to complete
 *     color:  string,   // hex color from the Monokai palette
 *   }
 */

/**
 * Full Monokai Pro palette available for goal colors.
 *
 * Each entry has a hex value and a human-readable name for display
 * in the color picker. The background and surface colors are omitted
 * because they would be invisible against the dark theme.
 */
export const MONOKAI_COLORS = [
  { hex: '#78dce8', name: 'Cyan'   },
  { hex: '#a9dc76', name: 'Green'  },
  { hex: '#ffd866', name: 'Yellow' },
  { hex: '#ab9df2', name: 'Purple' },
  { hex: '#fc9867', name: 'Orange' },
  { hex: '#ff6188', name: 'Red'    },
];

/**
 * Ordered list of hex values used when auto-assigning colors to new goals.
 *
 * New goals cycle through this sequence so the first few goals get
 * visually distinct colors without the user needing to choose.
 */
export const DEFAULT_COLOR_SEQUENCE = MONOKAI_COLORS.map((c) => c.hex);

/**
 * Returns the next color to auto-assign based on how many goals exist.
 *
 * Cycles through DEFAULT_COLOR_SEQUENCE using modulo so it wraps
 * gracefully if the user creates more goals than there are colors.
 *
 * @param {object[]} existingGoals - The current list of goals.
 * @returns {string} A hex color string.
 */
export function nextDefaultColor(existingGoals) {
  return DEFAULT_COLOR_SEQUENCE[existingGoals.length % DEFAULT_COLOR_SEQUENCE.length];
}

/**
 * Creates a new goal object with a stable unique id.
 *
 * Uses crypto.randomUUID() for id generation, which is available in
 * all modern browsers and in Node 19+. The id never changes after
 * creation — it is the key used in history data, so changing it
 * would orphan historical records.
 *
 * @param {{ name: string, target: number, emoji?: string, color?: string }} params
 * @returns {object} A complete goal object.
 */
export function createGoal({ name, target, emoji = null, color = DEFAULT_COLOR_SEQUENCE[0] }) {
  return {
    id: crypto.randomUUID(),
    name,
    emoji,
    target,
    color,
  };
}

/**
 * Returns a new goal with selected fields replaced.
 *
 * Preserves the original id so history lookups remain valid.
 * Does not mutate the original goal object.
 *
 * @param {object} goal    - The existing goal to update.
 * @param {object} changes - Partial goal fields to apply.
 * @returns {object} A new goal object.
 */
export function updateGoal(goal, changes) {
  return { ...goal, ...changes, id: goal.id };
}

/**
 * Moves a goal from one position to another in the list.
 *
 * Used by the drag-and-drop handler. Returns a new array without
 * mutating the original, which keeps React state updates clean.
 *
 * @param {object[]} goals     - Current ordered list of goals.
 * @param {number}   fromIndex - Index of the goal being moved.
 * @param {number}   toIndex   - Index to move it to.
 * @returns {object[]} New array with the goal repositioned.
 */
export function reorderGoals(goals, fromIndex, toIndex) {
  const result = [...goals];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}
