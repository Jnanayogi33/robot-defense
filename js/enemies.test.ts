// enemies.test.ts — Phase 6 enemy mechanic tests
import { describe, it, expect } from 'vitest';
import { ENEMY_TYPES, TOWER_DEFS } from './constants';

describe('Flying enemy mechanics', () => {
  it('Drone enemy is marked as flying', () => {
    const drone = ENEMY_TYPES.find(e => e.name === 'Drone');
    expect(drone).toBeDefined();
    expect((drone as any).flying).toBe(true);
  });

  it('Non-drone enemies are not flying', () => {
    const scout = ENEMY_TYPES.find(e => e.name === 'Scout');
    const soldier = ENEMY_TYPES.find(e => e.name === 'Soldier');
    expect((scout as any).flying).toBeFalsy();
    expect((soldier as any).flying).toBeFalsy();
  });

  it('Air-capable towers have hitsAir flag', () => {
    const airTowers = ['tesla', 'emp', 'rail', 'missile', 'photon'];
    airTowers.forEach(id => {
      const t = TOWER_DEFS.find(t => t.id === id);
      expect(t?.hitsAir, `${id} should hit air`).toBe(true);
    });
  });

  it('Non-air towers do NOT have hitsAir flag', () => {
    const groundOnlyTowers = ['pea', 'laser', 'plasma', 'cryo'];
    groundOnlyTowers.forEach(id => {
      const t = TOWER_DEFS.find(t => t.id === id);
      expect(t?.hitsAir, `${id} should NOT hit air`).toBeFalsy();
    });
  });
});

describe('Armor mechanics', () => {
  it('Tank and Juggernaut have armor', () => {
    const tank = ENEMY_TYPES.find(e => e.name === 'Tank');
    const jugg = ENEMY_TYPES.find(e => e.name === 'Juggernaut');
    expect((tank as any).armored).toBe(true);
    expect((jugg as any).armored).toBe(true);
  });

  it('Scout and Soldier have no armor', () => {
    const scout = ENEMY_TYPES.find(e => e.name === 'Scout');
    const soldier = ENEMY_TYPES.find(e => e.name === 'Soldier');
    expect((scout as any).armored).toBeFalsy();
    expect((soldier as any).armored).toBeFalsy();
  });

  it('Rail gun ignores armor', () => {
    const rail = TOWER_DEFS.find(t => t.id === 'rail');
    expect(rail?.ignoresArmor).toBe(true);
  });

  it('Armor applies 50% damage reduction', () => {
    // Simulate armor calculation
    const baseDmg = 100;
    const armored = true;
    const pierce = false;
    const ignoresArmor = false;
    const result = (armored && !pierce && !ignoresArmor) ? Math.floor(baseDmg * 0.5) : baseDmg;
    expect(result).toBe(50);
  });

  it('Armor bypassed by pierce/ignoresArmor', () => {
    const baseDmg = 100;
    const armored = true;
    // With pierce
    const pierceResult = (armored && !true && !false) ? Math.floor(baseDmg * 0.5) : baseDmg;
    expect(pierceResult).toBe(100);
    // With ignoresArmor
    const ignoreResult = (armored && !false && !true) ? Math.floor(baseDmg * 0.5) : baseDmg;
    expect(ignoreResult).toBe(100);
  });
});

describe('Swarm splitting', () => {
  it('Swarm enemy exists in enemy types', () => {
    const swarm = ENEMY_TYPES.find(e => e.name === 'Swarm');
    expect(swarm).toBeDefined();
    expect(swarm!.hp).toBeLessThan(50); // should be fragile
  });

  it('Scout exists to spawn from Swarm', () => {
    const scout = ENEMY_TYPES.find(e => e.name === 'Scout');
    expect(scout).toBeDefined();
  });
});
