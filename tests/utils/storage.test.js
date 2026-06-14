import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  serializeData,
  deserializeData,
  exportToJSON,
  importFromJSON,
  archiveGoal,
} from '../../src/utils/storage.js';

/**
 * Tests for storage serialization and data management utilities.
 *
 * These tests use plain objects rather than real file I/O so they
 * run in jsdom without filesystem access. The export/import functions
 * are tested by verifying they correctly serialize and round-trip data.
 */

const SAMPLE_GOALS = [
  { id: 'g1', name: 'Exercise', emoji: '🏃', target: 6, color: '#78dce8' },
  { id: 'g2', name: 'Reading', emoji: '📚', target: 5, color: '#a9dc76' },
];

const SAMPLE_HISTORY = {
  '2026-06-08': {
    g1: [true, true, false, true, true, false, false],
    g2: [true, false, true, true, false, false, true],
  },
};

describe('serializeData', () => {
  it('produces a JSON string from goals and history', () => {
    const result = serializeData(SAMPLE_GOALS, SAMPLE_HISTORY);
    expect(typeof result).toBe('string');
    const parsed = JSON.parse(result);
    expect(parsed.goals).toEqual(SAMPLE_GOALS);
    expect(parsed.history).toEqual(SAMPLE_HISTORY);
  });

  it('includes a version field for future migration support', () => {
    const result = JSON.parse(serializeData(SAMPLE_GOALS, SAMPLE_HISTORY));
    expect(result.version).toBeDefined();
  });
});

describe('deserializeData', () => {
  it('round-trips goals and history through serialize/deserialize', () => {
    const json = serializeData(SAMPLE_GOALS, SAMPLE_HISTORY);
    const { goals, history } = deserializeData(json);
    expect(goals).toEqual(SAMPLE_GOALS);
    expect(history).toEqual(SAMPLE_HISTORY);
  });

  it('returns empty defaults when given an empty string', () => {
    const { goals, history } = deserializeData('');
    expect(goals).toEqual([]);
    expect(history).toEqual({});
  });

  it('returns empty defaults when given malformed JSON', () => {
    const { goals, history } = deserializeData('not json {{{}');
    expect(goals).toEqual([]);
    expect(history).toEqual({});
  });
});

describe('archiveGoal', () => {
  it('moves a goal\'s history into an _archived namespace', () => {
    const history = { ...SAMPLE_HISTORY };
    const result = archiveGoal('g1', history);
    expect(result['2026-06-08']._archived?.g1).toEqual(
      SAMPLE_HISTORY['2026-06-08'].g1
    );
  });

  it('removes the goal from the active tracking data', () => {
    const history = { ...SAMPLE_HISTORY };
    const result = archiveGoal('g1', history);
    expect(result['2026-06-08'].g1).toBeUndefined();
  });

  it('leaves other goals untouched', () => {
    const history = { ...SAMPLE_HISTORY };
    const result = archiveGoal('g1', history);
    expect(result['2026-06-08'].g2).toEqual(SAMPLE_HISTORY['2026-06-08'].g2);
  });

  it('is a no-op for weeks where the goal has no data', () => {
    const history = { '2026-06-08': { g2: [true, false, true, true, false, false, true] } };
    const result = archiveGoal('g1', history);
    expect(result['2026-06-08'].g2).toBeDefined();
    expect(result['2026-06-08']._archived).toBeUndefined();
  });
});

describe('importFromJSON', () => {
  it('rejects data missing a goals array', () => {
    const bad = JSON.stringify({ version: 1, history: {} });
    expect(() => importFromJSON(bad)).toThrow();
  });

  it('rejects data missing a history object', () => {
    const bad = JSON.stringify({ version: 1, goals: [] });
    expect(() => importFromJSON(bad)).toThrow();
  });

  it('accepts valid serialized data', () => {
    const good = serializeData(SAMPLE_GOALS, SAMPLE_HISTORY);
    const { goals, history } = importFromJSON(good);
    expect(goals).toEqual(SAMPLE_GOALS);
    expect(history).toEqual(SAMPLE_HISTORY);
  });
});
