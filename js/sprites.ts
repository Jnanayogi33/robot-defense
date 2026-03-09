// sprites.ts — Sprite cache and loader for AI-generated artwork

const BASE = import.meta.env.BASE_URL || '/robot-defense/';
const SPRITES_DIR = `${BASE}assets/sprites/`;

const SPRITE_NAMES = [
  // Towers
  'tower-pea', 'tower-spark', 'tower-laser', 'tower-emp', 'tower-plasma',
  'tower-cryo', 'tower-tesla', 'tower-rail', 'tower-missile', 'tower-photon',
  'tower-gravity', 'tower-vortex', 'tower-disruptor', 'tower-plasmarocket',
  'tower-absolutezero', 'tower-annihilator', 'tower-prism',
  // Enemies
  'enemy-scout', 'enemy-soldier', 'enemy-tank', 'enemy-drone', 'enemy-mech',
  'enemy-swarm', 'enemy-titan', 'enemy-juggernaut', 'enemy-specter',
  // Hero
  'hero-aria7',
];

// Tower id → sprite name mapping
export const TOWER_SPRITE_MAP: Record<string, string> = {
  pea: 'tower-pea',
  spark: 'tower-spark',
  laser: 'tower-laser',
  emp: 'tower-emp',
  plasma: 'tower-plasma',
  cryo: 'tower-cryo',
  tesla: 'tower-tesla',
  rail: 'tower-rail',
  missile: 'tower-missile',
  photon: 'tower-photon',
  gravity: 'tower-gravity',
  vortex: 'tower-vortex',
  disruptor: 'tower-disruptor',
  plasmaRocket: 'tower-plasmarocket',
  absoluteZero: 'tower-absolutezero',
  annihilator: 'tower-annihilator',
  prism: 'tower-prism',
};

// Enemy name → sprite name mapping (lowercase)
export const ENEMY_SPRITE_MAP: Record<string, string> = {
  Scout: 'enemy-scout',
  Soldier: 'enemy-soldier',
  Tank: 'enemy-tank',
  Drone: 'enemy-drone',
  Mech: 'enemy-mech',
  Swarm: 'enemy-swarm',
  Titan: 'enemy-titan',
  Juggernaut: 'enemy-juggernaut',
  Specter: 'enemy-specter',
};

// Loaded sprite images
export const SpriteCache: Record<string, HTMLImageElement | null> = {};

let loaded = 0;
let total = 0;
let onReadyCb: (() => void) | null = null;

export function loadSprites(onReady?: () => void): void {
  total = SPRITE_NAMES.length;
  if (onReady) onReadyCb = onReady;

  for (const name of SPRITE_NAMES) {
    const img = new Image();
    img.onload = () => {
      SpriteCache[name] = img;
      loaded++;
      if (loaded >= total && onReadyCb) {
        onReadyCb();
        onReadyCb = null;
      }
    };
    img.onerror = () => {
      // Silently fail - canvas fallback will be used
      SpriteCache[name] = null;
      loaded++;
      if (loaded >= total && onReadyCb) {
        onReadyCb();
        onReadyCb = null;
      }
    };
    img.src = `${SPRITES_DIR}${name}.png`;
  }
}

export function getSprite(name: string): HTMLImageElement | null {
  return SpriteCache[name] ?? null;
}

export function isSpritesLoaded(): boolean {
  return loaded >= total;
}
