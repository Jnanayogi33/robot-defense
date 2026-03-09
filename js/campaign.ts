// campaign.ts — Campaign screens, star tracking, navigation
import { MAPS, WORLDS } from './data/maps';
import type { MapDef } from './types';

// ── STAR TRACKING (localStorage) ──────────────────────────────────────────
const STARS_KEY = 'rd_stars_v1';

export function getMapStars(mapId: string): number {
  const data = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
  return data[mapId] ?? 0;
}

export function setMapStars(mapId: string, stars: number): void {
  const data = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
  if (stars > (data[mapId] ?? 0)) {
    data[mapId] = stars;
    localStorage.setItem(STARS_KEY, JSON.stringify(data));
  }
}

export function getTotalStars(): number {
  const data = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
  return Object.values(data).reduce((sum: number, v) => sum + (v as number), 0);
}

export function calcStars(livesRemaining: number, maxLives: number): number {
  const pct = livesRemaining / maxLives;
  if (pct >= 0.8) return 3;
  if (pct >= 0.4) return 2;
  if (pct > 0) return 1;
  return 0;
}

// ── DIFFICULTY ────────────────────────────────────────────────────────────
const DIFF_KEY = 'rd_difficulty';
export type Difficulty = 'Recruit' | 'Sergeant' | 'Commander';

export function getDifficulty(): Difficulty {
  return (localStorage.getItem(DIFF_KEY) as Difficulty) || 'Sergeant';
}

export function setDifficulty(d: Difficulty): void {
  localStorage.setItem(DIFF_KEY, d);
}

export const DIFF_MULTIPLIERS: Record<Difficulty, { hp: number; gold: number }> = {
  Recruit:   { hp: 0.7,  gold: 1.3 },
  Sergeant:  { hp: 1.0,  gold: 1.0 },
  Commander: { hp: 1.5,  gold: 0.75 },
};

// ── NAVIGATION ────────────────────────────────────────────────────────────
type ScreenId = 'screen-menu' | 'screen-world-select' | 'screen-map-select' | 'screen-game' | 'screen-results';

export function showScreen(id: ScreenId): void {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.2s';
      el.style.opacity = '1';
    });
  }
}

// ── CAMPAIGN STATE ────────────────────────────────────────────────────────
export let currentMap: MapDef | null = null;
export let currentWorld = 1;

export function setCurrentMap(m: MapDef): void { currentMap = m; }
export function setCurrentWorld(w: number): void { currentWorld = w; }

// ── RENDER WORLD SELECT ───────────────────────────────────────────────────
export function renderWorldSelect(): void {
  const total = getTotalStars();
  const totalEl = document.getElementById('total-stars-display');
  if (totalEl) totalEl.textContent = `⭐ ${total}`;

  const container = document.getElementById('world-cards');
  if (!container) return;
  container.innerHTML = '';

  WORLDS.forEach(w => {
    const worldMaps = MAPS.filter(m => m.world === w.id);
    const worldStars = worldMaps.reduce((sum, m) => sum + getMapStars(m.id), 0);
    const maxStars = worldMaps.length * 3;
    const unlocked = total >= w.unlockStars;

    const card = document.createElement('div');
    card.className = `world-card ${unlocked ? '' : 'locked'}`;
    card.innerHTML = `
      <div class="world-icon" style="color:${w.color}">${unlocked ? '🌐' : '🔒'}</div>
      <h3 style="color:${w.color}">World ${w.id}</h3>
      <div class="world-name">${w.name}</div>
      <p class="world-desc">${w.description}</p>
      <div class="world-stars">${renderStars(worldStars, maxStars)}</div>
      ${!unlocked ? `<div class="unlock-req">🔒 Need ${w.unlockStars} ⭐ to unlock</div>` : ''}
    `;
    if (unlocked) {
      card.onclick = () => {
        setCurrentWorld(w.id);
        renderMapSelect(w.id);
        showScreen('screen-map-select');
      };
    }
    container.appendChild(card);
  });
}

// ── RENDER MAP SELECT ─────────────────────────────────────────────────────
export function renderMapSelect(worldId: number): void {
  const world = WORLDS.find(w => w.id === worldId);
  const title = document.getElementById('map-select-world-title');
  if (title && world) title.textContent = `World ${worldId}: ${world.name}`;

  const container = document.getElementById('map-cards');
  if (!container) return;
  container.innerHTML = '';

  const total = getTotalStars();
  const worldMaps = MAPS.filter(m => m.world === worldId);

  worldMaps.forEach(m => {
    const mapStars = getMapStars(m.id);
    const unlocked = total >= m.requiredStars;

    const card = document.createElement('div');
    card.className = `map-card ${unlocked ? '' : 'locked'}`;
    card.innerHTML = `
      <h3>Map ${m.id}</h3>
      <div class="map-name">${m.name}</div>
      <p class="map-desc">${m.description}</p>
      <div class="star-rating">${'⭐'.repeat(mapStars)}${'☆'.repeat(3 - mapStars)}</div>
      <div class="map-waves">Waves: ${m.waves.length}</div>
      ${!unlocked ? `<div class="unlock-req">🔒 Need ${m.requiredStars} ⭐</div>` : ''}
    `;
    if (unlocked) {
      card.onclick = () => launchMap(m);
    }
    container.appendChild(card);
  });

  // Difficulty buttons
  const diff = getDifficulty();
  document.querySelectorAll('.diff-btn').forEach(btn => {
    const b = btn as HTMLElement;
    b.classList.toggle('selected', b.dataset.diff === diff);
    b.onclick = () => {
      setDifficulty(b.dataset.diff as Difficulty);
      document.querySelectorAll('.diff-btn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
    };
  });
}

// ── LAUNCH MAP ────────────────────────────────────────────────────────────
export function launchMap(m: MapDef): void {
  setCurrentMap(m);
  const nameEl = document.getElementById('current-map-name');
  if (nameEl) nameEl.textContent = `Map ${m.id}: ${m.name}`;
  showScreen('screen-game');
  // Signal game to initialize with this map's path
  if ((window as any).initializeMap) (window as any).initializeMap(m);
}

// ── SHOW RESULTS ──────────────────────────────────────────────────────────
export function showResults(lives: number, maxLives: number, stats: {
  waves: number; kills: number; towers: number; gold: number;
}): void {
  if (!currentMap) return;

  const stars = calcStars(lives, maxLives);
  const prevStars = getMapStars(currentMap.id);
  const isNewRecord = stars > prevStars;
  setMapStars(currentMap.id, stars);

  const titleEl = document.getElementById('results-title');
  if (titleEl) titleEl.textContent = stars > 0 ? 'MISSION COMPLETE!' : 'MISSION FAILED';

  // Animate stars in
  const starsEl = document.getElementById('results-stars');
  if (starsEl) {
    starsEl.innerHTML = '';
    if (isNewRecord) {
      starsEl.innerHTML += '<div class="new-record">🏆 NEW RECORD!</div>';
    }
    for (let i = 1; i <= 3; i++) {
      const star = document.createElement('span');
      star.className = `result-star ${i <= stars ? 'earned' : 'empty'}`;
      star.textContent = i <= stars ? '⭐' : '☆';
      star.style.animationDelay = `${(i - 1) * 0.3}s`;
      starsEl.appendChild(star);
    }
  }

  const statsEl = document.getElementById('results-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat"><span>🌊 Waves</span><span>${stats.waves}</span></div>
      <div class="stat"><span>💀 Kills</span><span>${stats.kills}</span></div>
      <div class="stat"><span>🏗 Towers</span><span>${stats.towers}</span></div>
      <div class="stat"><span>💰 Gold</span><span>${stats.gold}</span></div>
    `;
  }

  // Next map button
  const nextBtn = document.getElementById('results-next');
  if (nextBtn) {
    const mapIdx = MAPS.findIndex(m => m.id === currentMap!.id);
    const nextMap = MAPS[mapIdx + 1];
    if (nextMap && stars > 0) {
      nextBtn.style.display = '';
      nextBtn.onclick = () => launchMap(nextMap);
    } else {
      nextBtn.style.display = 'none';
    }
  }

  const retryBtn = document.getElementById('results-retry');
  if (retryBtn) retryBtn.onclick = () => launchMap(currentMap!);

  const menuBtn = document.getElementById('results-menu');
  if (menuBtn) menuBtn.onclick = () => { renderWorldSelect(); showScreen('screen-world-select'); };

  showScreen('screen-results');
}

function renderStars(current: number, max: number): string {
  return `${current}/${max} ⭐`;
}

// ── INITIALIZE CAMPAIGN UI ────────────────────────────────────────────────
export function initCampaignUI(): void {
  // Play button
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.onclick = () => {
      renderWorldSelect();
      showScreen('screen-world-select');
    };
  }

  // Back buttons
  const backToMenu = document.getElementById('back-to-menu');
  if (backToMenu) backToMenu.onclick = () => showScreen('screen-menu');

  const backToWorld = document.getElementById('back-to-world');
  if (backToWorld) backToWorld.onclick = () => { renderWorldSelect(); showScreen('screen-world-select'); };

  const backToMap = document.getElementById('back-to-map');
  if (backToMap) backToMap.onclick = () => {
    renderMapSelect(currentWorld);
    showScreen('screen-map-select');
  };
}
