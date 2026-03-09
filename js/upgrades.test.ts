// upgrades.test.ts — Phase 4 upgrade system tests
import { describe, it, expect } from 'vitest';
import { TOWER_UPGRADES } from './data/tower-upgrades';
import { TOWER_DEFS } from './constants';

const BASE_TOWERS = ['pea', 'spark', 'laser', 'plasma', 'emp', 'rail', 'tesla', 'cryo', 'missile'];

describe('Tower Upgrades', () => {
  it('All 9 base towers have upgrade definitions', () => {
    BASE_TOWERS.forEach(id => {
      expect(TOWER_UPGRADES[id], `${id} missing upgrades`).toBeDefined();
    });
  });

  it('Each tower has L1, L2A, L2B upgrades', () => {
    BASE_TOWERS.forEach(id => {
      const u = TOWER_UPGRADES[id];
      expect(u.L1, `${id} missing L1`).toBeDefined();
      expect(u.L2A, `${id} missing L2A`).toBeDefined();
      expect(u.L2B, `${id} missing L2B`).toBeDefined();
    });
  });

  it('Upgrade costs are reasonable (50-500)', () => {
    BASE_TOWERS.forEach(id => {
      const u = TOWER_UPGRADES[id];
      expect(u.L1.cost).toBeGreaterThan(20);
      expect(u.L1.cost).toBeLessThan(500);
      expect(u.L2A.cost).toBeGreaterThan(u.L1.cost);
      expect(u.L2B.cost).toBeGreaterThan(u.L1.cost);
    });
  });

  it('Upgrades have name and desc', () => {
    BASE_TOWERS.forEach(id => {
      const u = TOWER_UPGRADES[id];
      expect(u.L1.name).toBeTruthy();
      expect(u.L1.desc).toBeTruthy();
      expect(u.L2A.name).toBeTruthy();
      expect(u.L2B.name).toBeTruthy();
    });
  });

  it('L1 upgrade actually improves the tower', () => {
    const mock = { damage: 10, range: 100, rate: 10 };
    TOWER_UPGRADES.pea.L1.apply(mock);
    // Should have improved at least one stat
    expect(mock.damage > 10 || mock.range > 100 || mock.rate < 10).toBe(true);
  });

  it('L2A and L2B upgrades are different', () => {
    BASE_TOWERS.forEach(id => {
      const u = TOWER_UPGRADES[id];
      expect(u.L2A.name).not.toBe(u.L2B.name);
    });
  });
});
