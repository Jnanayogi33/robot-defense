// maps.ts — 9 map definitions for 3 worlds
import type { MapDef } from '../types';

export const MAPS: MapDef[] = [
  // ── WORLD 1: Silicon Valley ──────────────────────────────────────────────
  {
    id: '1-1',
    world: 1,
    name: 'Tutorial Circuit',
    description: 'A simple curved path. Perfect for learning the basics.',
    requiredStars: 0,
    path: [
      [0,3],[1,3],[2,3],[3,3],[4,3],[4,4],[4,5],[4,6],[4,7],
      [5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[10,6],[10,5],[10,4],[10,3],[10,2],
      [11,2],[12,2],[13,2],[14,2],[15,2],[15,3],[15,4],[15,5],[15,6],[15,7],[15,8],[15,9],[15,10],
      [16,10],[17,10],[18,10],[19,10]
    ],
    waves: [
      { enemies: [{ type: 'Scout', count: 5 }] },
      { enemies: [{ type: 'Scout', count: 7 }, { type: 'Soldier', count: 2 }] },
      { enemies: [{ type: 'Scout', count: 5 }, { type: 'Soldier', count: 4 }] },
      { enemies: [{ type: 'Soldier', count: 6 }, { type: 'Tank', count: 1 }] },
      { enemies: [{ type: 'Scout', count: 8 }, { type: 'Soldier', count: 4 }, { type: 'Tank', count: 2 }] },
    ],
  },
  {
    id: '1-2',
    world: 1,
    name: 'Double Channel',
    description: 'Path splits then merges — watch both lanes!',
    requiredStars: 2,
    path: [
      [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],
      [10,3],[10,4],[10,5],[10,6],[10,7],[10,8],
      [11,8],[12,8],[13,8],[14,8],[15,8],[16,8],[17,8],[18,8],[19,8]
    ],
    waves: [
      { enemies: [{ type: 'Scout', count: 8 }] },
      { enemies: [{ type: 'Scout', count: 6 }, { type: 'Soldier', count: 4 }] },
      { enemies: [{ type: 'Soldier', count: 6 }, { type: 'Drone', count: 3 }] },
      { enemies: [{ type: 'Soldier', count: 6 }, { type: 'Tank', count: 3 }] },
      { enemies: [{ type: 'Swarm', count: 10 }, { type: 'Soldier', count: 4 }, { type: 'Tank', count: 2 }] },
      { enemies: [{ type: 'Tank', count: 3 }, { type: 'Drone', count: 5 }, { type: 'Mech', count: 1 }] },
    ],
  },
  {
    id: '1-3',
    world: 1,
    name: 'Chokepoint Run',
    description: 'Two tight bottlenecks — place your strongest towers there.',
    requiredStars: 5,
    path: [
      [0,7],[1,7],[2,7],[3,7],[4,7],[4,6],[4,5],[4,4],[4,3],[4,2],
      [5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],
      [12,3],[12,4],[12,5],[12,6],[12,7],[12,8],[12,9],[12,10],
      [13,10],[14,10],[15,10],[16,10],[16,9],[16,8],[16,7],[16,6],[16,5],
      [17,5],[18,5],[19,5]
    ],
    waves: [
      { enemies: [{ type: 'Scout', count: 10 }] },
      { enemies: [{ type: 'Soldier', count: 6 }, { type: 'Scout', count: 6 }] },
      { enemies: [{ type: 'Tank', count: 4 }, { type: 'Drone', count: 4 }] },
      { enemies: [{ type: 'Swarm', count: 12 }, { type: 'Soldier', count: 6 }] },
      { enemies: [{ type: 'Tank', count: 4 }, { type: 'Mech', count: 1 }, { type: 'Drone', count: 5 }] },
      { enemies: [{ type: 'Mech', count: 2 }, { type: 'Tank', count: 4 }, { type: 'Swarm', count: 8 }] },
      { enemies: [{ type: 'Titan', count: 1 }, { type: 'Soldier', count: 8 }, { type: 'Drone', count: 6 }] },
    ],
  },

  // ── WORLD 2: Industrial Zone ──────────────────────────────────────────────
  {
    id: '2-1',
    world: 2,
    name: 'Twin Assault',
    description: 'Two spawn points! Enemies come from both sides.',
    requiredStars: 9,
    path: [
      [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
      [9,3],[9,4],[9,5],[9,6],[9,7],
      [10,7],[11,7],[12,7],[13,7],[14,7],[15,7],[16,7],[17,7],[18,7],[19,7]
    ],
    waves: [
      { enemies: [{ type: 'Scout', count: 12 }, { type: 'Drone', count: 4 }] },
      { enemies: [{ type: 'Soldier', count: 8 }, { type: 'Swarm', count: 8 }] },
      { enemies: [{ type: 'Tank', count: 5 }, { type: 'Drone', count: 6 }] },
      { enemies: [{ type: 'Mech', count: 2 }, { type: 'Soldier', count: 8 }, { type: 'Swarm', count: 10 }] },
      { enemies: [{ type: 'Tank', count: 5 }, { type: 'Drone', count: 8 }, { type: 'Mech', count: 2 }] },
      { enemies: [{ type: 'Titan', count: 1 }, { type: 'Mech', count: 2 }, { type: 'Swarm', count: 12 }] },
      { enemies: [{ type: 'Titan', count: 2 }, { type: 'Tank', count: 6 }, { type: 'Drone', count: 8 }] },
    ],
  },
  {
    id: '2-2',
    world: 2,
    name: 'Labyrinth Grid',
    description: 'Maze-like zigzag. Many corners, many opportunities.',
    requiredStars: 12,
    path: [
      [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
      [9,2],[9,3],[9,4],[9,5],[9,6],[9,7],[9,8],[9,9],[9,10],[9,11],[9,12],
      [10,12],[11,12],[12,12],[13,12],[14,12],[15,12],[16,12],[17,12],[18,12],[19,12]
    ],
    waves: [
      { enemies: [{ type: 'Scout', count: 10 }, { type: 'Swarm', count: 8 }] },
      { enemies: [{ type: 'Soldier', count: 8 }, { type: 'Drone', count: 6 }] },
      { enemies: [{ type: 'Tank', count: 5 }, { type: 'Swarm', count: 12 }] },
      { enemies: [{ type: 'Mech', count: 2 }, { type: 'Tank', count: 4 }, { type: 'Drone', count: 6 }] },
      { enemies: [{ type: 'Titan', count: 1 }, { type: 'Mech', count: 2 }, { type: 'Tank', count: 4 }] },
      { enemies: [{ type: 'Titan', count: 2 }, { type: 'Swarm', count: 15 }, { type: 'Drone', count: 8 }] },
      { enemies: [{ type: 'Titan', count: 2 }, { type: 'Mech', count: 3 }, { type: 'Tank', count: 5 }] },
      { enemies: [{ type: 'Juggernaut', count: 1 }, { type: 'Titan', count: 1 }, { type: 'Swarm', count: 15 }] },
    ],
  },
  {
    id: '2-3',
    world: 2,
    name: 'Split Highway',
    description: 'Two completely separate roads. Enemies choose randomly.',
    requiredStars: 15,
    path: [
      [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],
      [12,5],[12,6],[12,7],[12,8],[12,9],[12,10],
      [13,10],[14,10],[15,10],[16,10],[17,10],[18,10],[19,10]
    ],
    waves: [
      { enemies: [{ type: 'Scout', count: 12 }, { type: 'Drone', count: 6 }] },
      { enemies: [{ type: 'Soldier', count: 10 }, { type: 'Swarm', count: 10 }] },
      { enemies: [{ type: 'Tank', count: 6 }, { type: 'Mech', count: 2 }] },
      { enemies: [{ type: 'Titan', count: 1 }, { type: 'Tank', count: 5 }, { type: 'Drone', count: 8 }] },
      { enemies: [{ type: 'Mech', count: 3 }, { type: 'Swarm', count: 15 }, { type: 'Drone', count: 8 }] },
      { enemies: [{ type: 'Titan', count: 2 }, { type: 'Mech', count: 3 }, { type: 'Tank', count: 6 }] },
      { enemies: [{ type: 'Juggernaut', count: 1 }, { type: 'Titan', count: 2 }, { type: 'Drone', count: 10 }] },
      { enemies: [{ type: 'Juggernaut', count: 2 }, { type: 'Mech', count: 4 }, { type: 'Swarm', count: 16 }] },
    ],
  },

  // ── WORLD 3: Cyberpunk Core ──────────────────────────────────────────────
  {
    id: '3-1',
    world: 3,
    name: 'Convergence Point',
    description: 'Three spawn lanes converge to center. Handle the surge!',
    requiredStars: 18,
    path: [
      [0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],
      [10,6],[10,5],[10,4],[10,3],[10,2],[10,1],
      [11,1],[12,1],[13,1],[14,1],[15,1],[16,1],[17,1],[18,1],[19,1]
    ],
    waves: [
      { enemies: [{ type: 'Mech', count: 3 }, { type: 'Tank', count: 5 }, { type: 'Drone', count: 8 }] },
      { enemies: [{ type: 'Titan', count: 2 }, { type: 'Swarm', count: 15 }, { type: 'Specter', count: 2 }] },
      { enemies: [{ type: 'Juggernaut', count: 1 }, { type: 'Titan', count: 2 }, { type: 'Mech', count: 4 }] },
      { enemies: [{ type: 'Specter', count: 4 }, { type: 'Tank', count: 8 }, { type: 'Drone', count: 10 }] },
      { enemies: [{ type: 'Juggernaut', count: 2 }, { type: 'Specter', count: 5 }, { type: 'Swarm', count: 20 }] },
      { enemies: [{ type: 'Juggernaut', count: 2 }, { type: 'Titan', count: 3 }, { type: 'Mech', count: 4 }, { type: 'Drone', count: 12 }] },
      { enemies: [{ type: 'Juggernaut', count: 3 }, { type: 'Specter', count: 8 }, { type: 'Titan', count: 3 }] },
    ],
  },
  {
    id: '3-2',
    world: 3,
    name: 'Spiral Vortex',
    description: 'A tight spiral path. Maximum coverage required!',
    requiredStars: 21,
    path: [
      [0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],[15,7],[16,7],[17,7],
      [17,6],[17,5],[17,4],[17,3],[17,2],[17,1],
      [16,1],[15,1],[14,1],[13,1],[12,1],[11,1],[10,1],[9,1],[8,1],[7,1],[6,1],[5,1],[4,1],[3,1],[2,1],[1,1],
      [1,2],[1,3],[1,4],[1,5],[1,6],
      [2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[15,6],[16,6],
      [16,5],[16,4],[16,3],[16,2],
      [15,2],[14,2],[13,2],[12,2],[11,2],[10,2],[9,2],[8,2],[7,2],[6,2],[5,2],[4,2],[3,2],[2,2],
      [2,3],[2,4],[2,5],
      [3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[14,5],[15,5],
      [15,4],[15,3],
      [14,3],[13,3],[12,3],[11,3],[10,3],[9,3],[8,3],[7,3],[6,3],[5,3],[4,3],[3,3],
      [3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4]
    ],
    waves: [
      { enemies: [{ type: 'Titan', count: 2 }, { type: 'Mech', count: 4 }, { type: 'Specter', count: 3 }] },
      { enemies: [{ type: 'Juggernaut', count: 1 }, { type: 'Specter', count: 5 }, { type: 'Swarm', count: 18 }] },
      { enemies: [{ type: 'Juggernaut', count: 2 }, { type: 'Titan', count: 3 }, { type: 'Drone', count: 12 }] },
      { enemies: [{ type: 'Specter', count: 8 }, { type: 'Mech', count: 5 }, { type: 'Tank', count: 8 }] },
      { enemies: [{ type: 'Juggernaut', count: 3 }, { type: 'Specter', count: 6 }, { type: 'Titan', count: 4 }] },
      { enemies: [{ type: 'Juggernaut', count: 3 }, { type: 'Titan', count: 4 }, { type: 'Mech', count: 6 }, { type: 'Specter', count: 8 }] },
      { enemies: [{ type: 'Juggernaut', count: 4 }, { type: 'Specter', count: 10 }, { type: 'Drone', count: 15 }] },
    ],
  },
  {
    id: '3-3',
    world: 3,
    name: 'Omega Terminus',
    description: 'Final stand. Complex multi-segment path. Boss waves. Survive!',
    requiredStars: 24,
    path: [
      [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[7,5],[7,4],[7,3],[7,2],[7,1],
      [8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],[15,1],[16,1],[17,1],[18,1],[19,1],
      [19,2],[19,3],[19,4],[19,5],[19,6],[19,7],[19,8],[19,9],[19,10],[19,11],[19,12],
      [18,12],[17,12],[16,12],[15,12],[14,12],[13,12],[12,12],[12,11],[12,10],[12,9],[12,8],[12,7],
      [11,7],[10,7],[9,7],[8,7],[7,7],[6,7],[5,7],[4,7],[3,7],[2,7],[1,7],[0,7]
    ],
    waves: [
      { enemies: [{ type: 'Juggernaut', count: 1 }, { type: 'Titan', count: 3 }, { type: 'Specter', count: 5 }] },
      { enemies: [{ type: 'Juggernaut', count: 2 }, { type: 'Mech', count: 6 }, { type: 'Drone', count: 12 }] },
      { enemies: [{ type: 'Juggernaut', count: 2 }, { type: 'Specter', count: 10 }, { type: 'Swarm', count: 20 }] },
      { enemies: [{ type: 'Juggernaut', count: 3 }, { type: 'Titan', count: 4 }, { type: 'Mech', count: 6 }] },
      { enemies: [{ type: 'Juggernaut', count: 4 }, { type: 'Specter', count: 12 }, { type: 'Tank', count: 10 }] },
      { enemies: [{ type: 'Juggernaut', count: 4 }, { type: 'Titan', count: 5 }, { type: 'Mech', count: 8 }, { type: 'Specter', count: 10 }] },
      { enemies: [{ type: 'Juggernaut', count: 5 }, { type: 'Specter', count: 15 }, { type: 'Drone', count: 20 }] },
      { enemies: [{ type: 'Juggernaut', count: 6 }, { type: 'Titan', count: 6 }, { type: 'Mech', count: 8 }, { type: 'Specter', count: 12 }] },
    ],
  },
];

export const WORLDS = [
  { id: 1, name: 'Silicon Valley', description: 'Robot uprising begins. Learn the basics.', color: '#0ff', unlockStars: 0 },
  { id: 2, name: 'Industrial Zone', description: 'Robots have escalated. Multiple attack vectors.', color: '#fa0', unlockStars: 9 },
  { id: 3, name: 'Cyberpunk Core', description: 'Final frontier. Elite robot forces. Survive!', color: '#f0f', unlockStars: 18 },
];
