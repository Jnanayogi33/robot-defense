// game.test.ts — Vitest smoke tests for Phase 1
import { describe, it, expect } from 'vitest';
import { TOWER_DEFS, ENEMY_TYPES, PATH, buildPath, FUSION_DEFS } from './constants';

describe('Game constants', () => {
  it('TOWER_DEFS count equals 12', () => {
    expect(TOWER_DEFS.length).toBe(12);
  });

  it('PATH.length > 0', () => {
    const path = buildPath();
    expect(path.length).toBeGreaterThan(0);
  });

  it('PATH has correct entries from PATH_POINTS', () => {
    const path = buildPath();
    // Path starts at [0,3] and ends at [19,10]
    expect(path[0]).toEqual([0, 3]);
    expect(path[path.length - 1]).toEqual([19, 10]);
  });

  it('ENEMY_TYPES has 9 entries', () => {
    expect(ENEMY_TYPES.length).toBe(9);
  });

  it('All TOWER_DEFS have required fields', () => {
    TOWER_DEFS.forEach(def => {
      expect(def.id).toBeTruthy();
      expect(def.name).toBeTruthy();
      expect(def.cost).toBeGreaterThan(0);
      expect(def.range).toBeGreaterThan(0);
      expect(def.damage).toBeGreaterThan(0);
    });
  });

  it('FUSION_DEFS has entries', () => {
    expect(Object.keys(FUSION_DEFS).length).toBeGreaterThan(0);
  });
});
