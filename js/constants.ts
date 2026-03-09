// constants.ts — game constants, tower defs, enemy types, paths
import type { TowerDef, EnemyType } from './types';

export const COLS = 20;
export const ROWS = 14;
export const TILE = 36;

export const TOWER_DEFS: TowerDef[] = [
  { id:'pea', name:'Pea Shooter', cost:20, range:90, damage:3, rate:4, color:'#4f4',
    desc:'Super cheap, rapid fire', bulletColor:'#4f4', bulletSpeed:9, splash:0 },
  { id:'spark', name:'Spark Tower', cost:35, range:100, damage:5, rate:7, color:'#fd4',
    desc:'Budget zapper', bulletColor:'#fd4', bulletSpeed:7, splash:0 },
  { id:'laser', name:'Laser Turret', cost:50, range:120, damage:8, rate:8, color:'#0ff',
    desc:'Fast beam weapon', bulletColor:'#0ff', bulletSpeed:8, splash:0 },
  { id:'plasma', name:'Plasma Cannon', cost:100, range:140, damage:30, rate:25, color:'#f0f',
    desc:'Heavy plasma bolts', bulletColor:'#f0f', bulletSpeed:5, splash:30 },
  { id:'emp', name:'EMP Tower', cost:75, range:110, damage:5, rate:15, color:'#ff0',
    desc:'Slows all nearby bots', bulletColor:'#ff0', bulletSpeed:6, splash:0, slow:0.4 },
  { id:'rail', name:'Railgun', cost:150, range:200, damage:60, rate:50, color:'#f60',
    desc:'Long-range piercer', bulletColor:'#f84', bulletSpeed:12, splash:0, pierce:true },
  { id:'tesla', name:'Tesla Coil', cost:120, range:100, damage:15, rate:12, color:'#8ff',
    desc:'Chain lightning x3', bulletColor:'#8ff', bulletSpeed:0, splash:0, chain:3 },
  { id:'cryo', name:'Cryo Cannon', cost:90, range:130, damage:12, rate:18, color:'#6ef',
    desc:'Freezes in AOE', bulletColor:'#aef', bulletSpeed:5, splash:45, slow:0.6 },
  { id:'missile', name:'Missile Battery', cost:175, range:220, damage:45, rate:35, color:'#f92',
    desc:'Homing missiles', bulletColor:'#f92', bulletSpeed:4, splash:40, homing:true },
  { id:'photon', name:'Photon Blaster', cost:65, range:115, damage:14, rate:5, color:'#ff9900',
    desc:'Rapid energy bolts', bulletColor:'#ffc200', bulletSpeed:11, splash:0 },
  { id:'gravity', name:'Gravity Well', cost:200, range:165, damage:6, rate:18, color:'#8844ff',
    desc:'AOE slow field', bulletColor:'#aa66ff', bulletSpeed:4, splash:75, slow:0.65 },
  { id:'vortex', name:'Vortex Cannon', cost:250, range:185, damage:55, rate:30, color:'#ff44ff',
    desc:'Pierce+AOE blast', bulletColor:'#ff88ff', bulletSpeed:7, splash:45, pierce:true },
];

export const MINE_DEF = {
  id: 'mine',
  name: 'Proximity Mine',
  cost: 40,
  color: '#f42',
  damage: 80,
  splashRadius: 50,
  desc: 'Place on road',
};

export const FUSION_DEFS: Record<string, TowerDef> = {
  'laser+emp':    { id:'disruptor',   name:'Disruptor',    cost:0, range:140, damage:22, rate:10, color:'#ffe100', desc:'Laser+EMP fusion',     bulletColor:'#ffe100', bulletSpeed:9,  splash:22, slow:0.55 },
  'emp+laser':    { id:'disruptor',   name:'Disruptor',    cost:0, range:140, damage:22, rate:10, color:'#ffe100', desc:'Laser+EMP fusion',     bulletColor:'#ffe100', bulletSpeed:9,  splash:22, slow:0.55 },
  'plasma+missile':{ id:'plasmaRocket',name:'Plasma Rocket',cost:0, range:200, damage:85, rate:38, color:'#ff6600', desc:'Plasma+Missile fusion', bulletColor:'#ff6a00', bulletSpeed:5, splash:55, homing:true },
  'missile+plasma':{ id:'plasmaRocket',name:'Plasma Rocket',cost:0, range:200, damage:85, rate:38, color:'#ff6600', desc:'Plasma+Missile fusion', bulletColor:'#ff6a00', bulletSpeed:5, splash:55, homing:true },
  'tesla+cryo':   { id:'absoluteZero',name:'Absolute Zero',cost:0, range:125, damage:28, rate:12, color:'#00eeff', desc:'Tesla+Cryo fusion',     bulletColor:'#00eeff', bulletSpeed:0,  splash:50, slow:0.85, chain:4 },
  'cryo+tesla':   { id:'absoluteZero',name:'Absolute Zero',cost:0, range:125, damage:28, rate:12, color:'#00eeff', desc:'Tesla+Cryo fusion',     bulletColor:'#00eeff', bulletSpeed:0,  splash:50, slow:0.85, chain:4 },
  'rail+plasma':  { id:'annihilator', name:'Annihilator',  cost:0, range:230, damage:110,rate:55, color:'#ffffff', desc:'Rail+Plasma fusion',    bulletColor:'#ffffff', bulletSpeed:14, splash:18, pierce:true },
  'plasma+rail':  { id:'annihilator', name:'Annihilator',  cost:0, range:230, damage:110,rate:55, color:'#ffffff', desc:'Rail+Plasma fusion',    bulletColor:'#ffffff', bulletSpeed:14, splash:18, pierce:true },
  'photon+vortex':{ id:'prism',       name:'Prism Cannon', cost:0, range:200, damage:70, rate:8,  color:'#ff00ff', desc:'Photon+Vortex fusion',  bulletColor:'#ff88ff', bulletSpeed:10, splash:35, pierce:true, chain:2 },
  'vortex+photon':{ id:'prism',       name:'Prism Cannon', cost:0, range:200, damage:70, rate:8,  color:'#ff00ff', desc:'Photon+Vortex fusion',  bulletColor:'#ff88ff', bulletSpeed:10, splash:35, pierce:true, chain:2 },
};

export const ENEMY_TYPES: EnemyType[] = [
  { name:'Scout',      hp:30,   speed:1.8,  reward:10,  color:'#f44', size:6  },
  { name:'Soldier',    hp:80,   speed:1.2,  reward:20,  color:'#fa0', size:8  },
  { name:'Tank',       hp:200,  speed:0.7,  reward:40,  color:'#a44', size:11 },
  { name:'Drone',      hp:50,   speed:2.5,  reward:15,  color:'#4af', size:5  },
  { name:'Mech',       hp:500,  speed:0.5,  reward:80,  color:'#f4f', size:18 },
  { name:'Swarm',      hp:20,   speed:2.2,  reward:5,   color:'#4f4', size:4  },
  { name:'Titan',      hp:1500, speed:0.35, reward:200, color:'#fff', size:22 },
  { name:'Juggernaut', hp:6000, speed:0.18, reward:600, color:'#ff2244', size:30 },
  { name:'Specter',    hp:900,  speed:5.0,  reward:400, color:'#88ffee', size:7  },
];

export const PATH_POINTS: [number, number][] = [
  [0,3],[4,3],[4,7],[10,7],[10,2],[15,2],[15,10],[19,10]
];

export function buildPath(): [number, number][] {
  const path: [number, number][] = [];
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const [x1, y1] = PATH_POINTS[i];
    const [x2, y2] = PATH_POINTS[i + 1];
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    let cx = x1, cy = y1;
    while (cx !== x2 || cy !== y2) {
      path.push([cx, cy]);
      if (cx !== x2) cx += dx;
      else cy += dy;
    }
  }
  path.push(PATH_POINTS[PATH_POINTS.length - 1]);
  return path;
}

export const PATH = buildPath();
export const pathSet = new Set(PATH.map(p => p[0] + ',' + p[1]));
