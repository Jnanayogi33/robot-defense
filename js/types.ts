// types.ts — TypeScript interfaces for Future Defense: Robot Uprising

export interface TowerDef {
  id: string;
  name: string;
  cost: number;
  range: number;
  damage: number;
  rate: number;
  color: string;
  desc: string;
  bulletColor: string;
  bulletSpeed: number;
  splash: number;
  slow?: number;
  pierce?: boolean;
  chain?: number;
  homing?: boolean;
}

export interface EnemyType {
  name: string;
  hp: number;
  speed: number;
  reward: number;
  color: string;
  size: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export interface Tower {
  col: number;
  row: number;
  x: number;
  y: number;
  def: TowerDef;
  cooldown: number;
  angle: number;
  fireFlash: number;
  fused?: boolean;
  chainTargets?: Enemy[];
  chainTimer?: number;
}

export interface Enemy {
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  pathIdx: number;
  x: number;
  y: number;
  slowTimer: number;
  walkCycle: number;
  facing: number;
  done?: boolean;
}

export interface Bullet {
  x: number;
  y: number;
  tx: number;
  ty: number;
  target: Enemy | null;
  speed: number;
  damage: number;
  color: string;
  splash: number;
  slow: number;
  pierce: boolean;
  homing: boolean;
  trail: TrailPoint[];
  towerId: string;
  hit?: boolean;
  angle?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size?: number;
  gravity?: number;
  glow?: boolean;
  spark?: boolean;
  ring?: boolean;
  ringR?: number;
  ringMax?: number;
  maxLife?: number;
}

export interface Mine {
  col: number;
  row: number;
  x: number;
  y: number;
  armed: boolean;
  armTimer: number;
  detonated: boolean;
  flashTimer: number;
}

export interface MapDef {
  id: string;
  world: number;
  name: string;
  description: string;
  path: [number, number][];
  waves: WaveDef[];
  requiredStars: number;
}

export interface WaveDef {
  enemies: Array<{ type: string; count: number }>;
}

export interface GameState {
  money: number;
  lives: number;
  waveNum: number;
  score: number;
  gameTime: number;
  overclockTimer: number;
  towers: Tower[];
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  mines: Mine[];
  spawnQueue: Enemy[];
  spawnTimer: number;
  msg: string;
  msgTimer: number;
  waveActive: boolean;
  selectedTower: TowerDef | null;
  selling: boolean;
  fuseMode: boolean;
  fuseTarget: Tower | null;
  placingMine: boolean;
  gameSpeed: number;
}
