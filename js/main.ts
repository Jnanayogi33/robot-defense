// main.ts — Entry point for the game
import { s } from './state';
import { sizeCanvas, update, startWave, restartGame, sellMode, toggleFuse, setSpeed, C, ctx } from './game';
import { draw } from './draw';
import { Music } from './audio';
import { loadSprites } from './sprites';
import { initCampaignUI, showResults, showScreen, getDifficulty, DIFF_MULTIPLIERS, launchMap } from './campaign';
import { PATH, pathSet, TILE, COLS, ROWS, buildPath, PATH_POINTS, ENEMY_TYPES } from './constants';
import type { MapDef } from './types';

// ── EXPOSE GLOBALS ────────────────────────────────────────────────────────
(window as any).startWave = startWave;
(window as any).restartGame = restartGame;
(window as any).sellMode = sellMode;
(window as any).toggleFuse = toggleFuse;
(window as any).setSpeed = setSpeed;
(window as any).Music = Music;

// ── MAP INITIALIZATION ────────────────────────────────────────────────────
let currentMapDef: MapDef | null = null;
let currentMapPath: [number, number][] = PATH;
let currentMapPathSet: Set<string> = pathSet;
let currentWaveIndex = 0;
let totalKills = 0;
let totalGold = 200;
let gameStartLives = 20;

// Override initializeMap to handle campaign maps
(window as any).initializeMap = (mapDef: MapDef) => {
  currentMapDef = mapDef;
  currentMapPath = mapDef.path;
  currentMapPathSet = new Set(mapDef.path.map((p: [number, number]) => p[0] + ',' + p[1]));
  currentWaveIndex = 0;
  totalKills = 0;
  totalGold = 200;
  gameStartLives = 20;

  // Reset game state
  s.money = 200;
  s.lives = 20;
  s.waveNum = 0;
  s.score = 0;
  s.towers = [];
  s.enemies = [];
  s.bullets = [];
  s.particles = [];
  s.spawnQueue = [];
  s.mines = [];
  s.waveActive = false;
  s.selectedTower = null;
  s.selling = false;
  s.placingMine = false;

  // Patch constants - update the pathSet used by game handlers
  (window as any)._currentPath = currentMapPath;
  (window as any)._currentPathSet = currentMapPathSet;
};

// Override startWave to use campaign waves
const origStartWave = startWave;
(window as any).startWave = () => {
  if (s.waveActive) return;
  if (currentMapDef && currentWaveIndex < currentMapDef.waves.length) {
    // Campaign wave
    const waveDef = currentMapDef.waves[currentWaveIndex];
    currentWaveIndex++;
    s.waveNum++;
    s.waveActive = true;
    s.spawnQueue = [];

    {
      const diff = getDifficulty();
      const mults = DIFF_MULTIPLIERS[diff];
      waveDef.enemies.forEach(group => {
        const enemyType = ENEMY_TYPES.find(e => e.name === group.type);
        if (!enemyType) return;
        for (let i = 0; i < group.count; i++) {
          const startPt = currentMapPath[0];
          s.spawnQueue.push({
            type: enemyType,
            hp: Math.floor(enemyType.hp * mults.hp),
            maxHp: Math.floor(enemyType.hp * mults.hp),
            speed: enemyType.speed,
            reward: Math.floor(enemyType.reward * mults.gold),
            pathIdx: 0,
            x: startPt[0] * TILE + TILE / 2,
            y: startPt[1] * TILE + TILE / 2,
            slowTimer: 0,
            walkCycle: Math.random() * Math.PI * 2,
            facing: 0,
          });
        }
      });
      s.spawnTimer = 18;
    }
  } else {
    // Fallback to original procedural waves
    origStartWave();
  }
};

// Override restartGame to go back to map select
(window as any).restartGame = () => {
  if (currentMapDef) {
    launchMap(currentMapDef);
  } else {
    restartGame();
  }
};

// ── CANVAS SETUP ──────────────────────────────────────────────────────────
sizeCanvas();

// ── SPRITE LOADING ────────────────────────────────────────────────────────
loadSprites();

// ── CAMPAIGN UI ───────────────────────────────────────────────────────────
initCampaignUI();

// ── WAVE COMPLETE DETECTION & RESULTS ─────────────────────────────────────
let lastWaveActive = false;
let resultsShown = false;

// ── GAME LOOP ─────────────────────────────────────────────────────────────
function loop(): void {
  // Track gold earned
  const prevMoney = totalGold;

  for (let i = 0; i < s.gameSpeed; i++) {
    if (s.lives > 0) update();
  }
  draw();

  // Check if all waves done and enemies cleared
  if (currentMapDef && s.waveNum > 0 && !s.waveActive && s.enemies.length === 0
      && s.spawnQueue.length === 0 && !resultsShown
      && currentWaveIndex >= currentMapDef.waves.length) {
    resultsShown = true;
    setTimeout(() => {
      showResults(s.lives, gameStartLives, {
        waves: s.waveNum,
        kills: totalKills,
        towers: s.towers.length,
        gold: s.money,
      });
    }, 2000);
  }

  // Check game over
  if (s.lives <= 0 && currentMapDef && !resultsShown) {
    resultsShown = true;
    setTimeout(() => {
      showResults(0, gameStartLives, {
        waves: s.waveNum,
        kills: totalKills,
        towers: s.towers.length,
        gold: s.money,
      });
    }, 2000);
  }

  requestAnimationFrame(loop);
}

loop();

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/robot-defense/sw.js', { updateViaCache: 'none' })
      .catch(() => {});
  });
}
