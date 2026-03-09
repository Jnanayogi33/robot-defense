// state.ts — Shared mutable game state
import type { Tower, Enemy, Bullet, Particle, Mine, TowerDef, GameState } from './types';

export const s: GameState = {

  money: 200,
  lives: 20,
  waveNum: 0,
  score: 0,
  gameTime: 0,
  overclockTimer: 0,
  towers: [] as Tower[],
  enemies: [] as Enemy[],
  bullets: [] as Bullet[],
  particles: [] as Particle[],
  mines: [] as Mine[],
  spawnQueue: [] as Enemy[],
  spawnTimer: 0,
  msg: '',
  msgTimer: 0,
  waveActive: false,
  selectedTower: null as TowerDef | null,
  selling: false,
  fuseMode: false,
  fuseTarget: null as Tower | null,
  placingMine: false,
  gameSpeed: 1,
};
