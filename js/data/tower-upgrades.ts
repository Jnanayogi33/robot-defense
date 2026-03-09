// tower-upgrades.ts — Upgrade tree for all 9 base towers
// Each tower: L1 (flat improvement), L2A and L2B (binary choice)

export interface UpgradeDef {
  cost: number;
  name: string;
  desc: string;
  apply: (t: any) => void;  // Mutates the tower def
}

export interface TowerUpgrades {
  L1: UpgradeDef;
  L2A: UpgradeDef;
  L2B: UpgradeDef;
}

export const TOWER_UPGRADES: Record<string, TowerUpgrades> = {
  pea: {
    L1: {
      cost: 30,
      name: 'Enhanced Peas',
      desc: '+50% damage, +20% range',
      apply: t => { t.damage = Math.floor(t.damage * 1.5); t.range = Math.floor(t.range * 1.2); },
    },
    L2A: {
      cost: 60,
      name: 'Gatling Peas',
      desc: 'Triple fire rate (rapid assault)',
      apply: t => { t.rate = Math.max(1, Math.floor(t.rate / 3)); t.name = 'Gatling Peas'; t.color = '#00ff44'; },
    },
    L2B: {
      cost: 60,
      name: 'Giant Pea',
      desc: 'Massive damage, splash radius added',
      apply: t => { t.damage *= 6; t.splash = 40; t.rate *= 3; t.name = 'Giant Pea'; t.color = '#00aa00'; },
    },
  },

  spark: {
    L1: {
      cost: 45,
      name: 'Overcharged Spark',
      desc: '+60% damage, +15% range',
      apply: t => { t.damage = Math.floor(t.damage * 1.6); t.range = Math.floor(t.range * 1.15); },
    },
    L2A: {
      cost: 90,
      name: 'Chain Spark',
      desc: 'Chains to 2 additional targets',
      apply: t => { t.chain = 2; t.damage = Math.floor(t.damage * 1.3); t.name = 'Chain Spark'; t.color = '#ffdd44'; },
    },
    L2B: {
      cost: 90,
      name: 'Storm Coil',
      desc: '+100% damage, permanent slow field',
      apply: t => { t.damage *= 2; t.slow = 0.45; t.name = 'Storm Coil'; t.color = '#ffaa00'; },
    },
  },

  laser: {
    L1: {
      cost: 70,
      name: 'Precision Laser',
      desc: '+50% damage, +25% fire rate',
      apply: t => { t.damage = Math.floor(t.damage * 1.5); t.rate = Math.max(1, Math.floor(t.rate * 0.75)); },
    },
    L2A: {
      cost: 140,
      name: 'Pulse Laser',
      desc: 'Piercing beam, +100% damage',
      apply: t => { t.pierce = true; t.damage *= 2; t.name = 'Pulse Laser'; t.color = '#00ffff'; },
    },
    L2B: {
      cost: 140,
      name: 'Overload Laser',
      desc: 'Massive damage, slower rate, splash',
      apply: t => { t.damage *= 4; t.rate = Math.floor(t.rate * 2); t.splash = 30; t.name = 'Overload Laser'; t.color = '#ff4488'; },
    },
  },

  plasma: {
    L1: {
      cost: 130,
      name: 'Dense Plasma',
      desc: '+40% damage, +30% splash radius',
      apply: t => { t.damage = Math.floor(t.damage * 1.4); t.splash = Math.floor(t.splash * 1.3); },
    },
    L2A: {
      cost: 260,
      name: 'Plasma Storm',
      desc: '+80% damage, double splash radius',
      apply: t => { t.damage = Math.floor(t.damage * 1.8); t.splash *= 2; t.name = 'Plasma Storm'; t.color = '#ff00ff'; },
    },
    L2B: {
      cost: 260,
      name: 'Singularity Plasma',
      desc: 'Homing plasma bolts, pierce, +60% damage',
      apply: t => { t.homing = true; t.pierce = true; t.damage = Math.floor(t.damage * 1.6); t.name = 'Singularity Plasma'; t.color = '#aa00ff'; },
    },
  },

  emp: {
    L1: {
      cost: 90,
      name: 'Broadband EMP',
      desc: '+50% range, stronger slow',
      apply: t => { t.range = Math.floor(t.range * 1.5); t.slow = 0.6; },
    },
    L2A: {
      cost: 180,
      name: 'Mega EMP',
      desc: 'Massive AOE slow (double range)',
      apply: t => { t.range *= 2; t.splash = 80; t.damage = Math.floor(t.damage * 1.5); t.name = 'Mega EMP'; t.color = '#ffff00'; },
    },
    L2B: {
      cost: 180,
      name: 'Scrambler EMP',
      desc: 'Deals heavy damage + slow',
      apply: t => { t.damage *= 5; t.slow = 0.7; t.splash = 50; t.name = 'Scrambler EMP'; t.color = '#aaff00'; },
    },
  },

  rail: {
    L1: {
      cost: 200,
      name: 'High-Caliber Rail',
      desc: '+50% damage, longer range',
      apply: t => { t.damage = Math.floor(t.damage * 1.5); t.range = Math.floor(t.range * 1.2); },
    },
    L2A: {
      cost: 400,
      name: 'Hyperrail',
      desc: '+100% damage, instant fire rate boost',
      apply: t => { t.damage *= 2; t.rate = Math.max(1, Math.floor(t.rate * 0.6)); t.name = 'Hyperrail'; t.color = '#ff8800'; },
    },
    L2B: {
      cost: 400,
      name: 'Artillery Rail',
      desc: 'Massive splash, still pierces',
      apply: t => { t.splash = 60; t.damage *= 1.5; t.bulletSpeed *= 0.7; t.name = 'Artillery Rail'; t.color = '#ff4400'; },
    },
  },

  tesla: {
    L1: {
      cost: 150,
      name: 'Storm Tesla',
      desc: '+50% damage, +1 chain target',
      apply: t => { t.damage = Math.floor(t.damage * 1.5); t.chain = (t.chain || 3) + 1; },
    },
    L2A: {
      cost: 300,
      name: 'Thunder Tesla',
      desc: 'Chain 6 targets, +100% damage',
      apply: t => { t.chain = 6; t.damage *= 2; t.name = 'Thunder Tesla'; t.color = '#88ffff'; },
    },
    L2B: {
      cost: 300,
      name: 'Plasma Tesla',
      desc: 'AOE lightning explosion on hit',
      apply: t => { t.splash = 55; t.damage = Math.floor(t.damage * 1.8); t.name = 'Plasma Tesla'; t.color = '#ffffff'; },
    },
  },

  cryo: {
    L1: {
      cost: 120,
      name: 'Deep Freeze',
      desc: 'Stronger freeze, +30% damage',
      apply: t => { t.slow = 0.8; t.damage = Math.floor(t.damage * 1.3); t.splash = Math.floor(t.splash * 1.3); },
    },
    L2A: {
      cost: 240,
      name: 'Blizzard Cannon',
      desc: 'Huge freeze area, +50% damage',
      apply: t => { t.splash *= 2; t.damage = Math.floor(t.damage * 1.5); t.name = 'Blizzard Cannon'; t.color = '#aaeeff'; },
    },
    L2B: {
      cost: 240,
      name: 'Ice Shatter',
      desc: 'Frozen enemies take 3x damage',
      apply: t => { t.damage *= 3; t.slow = 0.9; t.name = 'Ice Shatter'; t.color = '#ffffff'; },
    },
  },

  missile: {
    L1: {
      cost: 220,
      name: 'Improved Warhead',
      desc: '+40% damage, +30% splash radius',
      apply: t => { t.damage = Math.floor(t.damage * 1.4); t.splash = Math.floor(t.splash * 1.3); },
    },
    L2A: {
      cost: 440,
      name: 'MIRV Battery',
      desc: 'Each missile spawns 3 sub-missiles on hit',
      apply: t => { t.damage = Math.floor(t.damage * 1.5); t.splash = Math.floor(t.splash * 1.5); t.name = 'MIRV Battery'; t.color = '#ff9944'; },
    },
    L2B: {
      cost: 440,
      name: 'Nuke Launcher',
      desc: 'Massive AOE, slow + damage',
      apply: t => { t.damage *= 2; t.splash *= 2; t.slow = 0.5; t.name = 'Nuke Launcher'; t.color = '#ffcc00'; },
    },
  },
};
