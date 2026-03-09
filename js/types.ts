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
  hitsAir?: boolean;    // can target flying enemies
  ignoresArmor?: boolean; // bullets ignore armor
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
  targetAngle?: number;    // smooth rotation target
  fireFlash: number;
  recoil?: number;         // recoil animation [0..1]
  fused?: boolean;
  chainTargets?: Enemy[];
  chainTimer?: number;
  // Upgrade system
  level?: number;           // 0 = base, 1 = L1, 2 = L2
  upgradePath?: 'A' | 'B' | null;
  baseCost?: number;        // Original purchase cost for sell calculation
  upgradeGlow?: string;     // Glow color for upgrade visuals
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
  stunTimer?: number;  // EMP stun
  hitFlash?: number;   // white flash on damage [0..4]
}

export interface EnemyTypeExt extends EnemyType {
  flying?: boolean;   // flies over path (Drone)
  armored?: boolean;  // reduces non-pierce damage by 50%
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
  hitsAir?: boolean;    // can hit flying enemies
  ignorArmor?: boolean; // ignores armor reduction
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

export interface Hero {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  empCooldown: number;
  shield: number;
  retreating: boolean;
  retreatTimer: number;
  dragging: boolean;
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

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  vy: number;
  color: string;
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
  hero: Hero | null;
  floatingTexts: FloatingText[];
  screenShake: number;
}
