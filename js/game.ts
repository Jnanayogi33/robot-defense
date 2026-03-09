// game.ts — Game logic, update loop, event handlers
import { s } from './state';
import { COLS, ROWS, TILE, TOWER_DEFS, MINE_DEF, FUSION_DEFS, ENEMY_TYPES, PATH, pathSet } from './constants';
import { spawnParticles, spawnDeathExplosion, spawnMineExplosion } from './particles';
import { Sounds, Music } from './audio';
import type { TowerDef, Tower, Enemy } from './types';

export const C = document.getElementById('c') as HTMLCanvasElement;
export const ctx = C.getContext('2d') as CanvasRenderingContext2D;

C.width = COLS * TILE;
C.height = ROWS * TILE;

export function sizeCanvas(): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 8;
  const sidebarW = Math.min(200, vw * 0.24);
  const availH = vh - padding;
  const scaleByW = (vw - sidebarW - padding) / COLS;
  const scale = scaleByW;
  const cssW = Math.floor(scale * COLS);
  const cssH = Math.floor(scale * ROWS);
  C.style.width = cssW + 'px';
  C.style.height = cssH + 'px';
  const wrap = document.getElementById('canvas-wrap');
  if (wrap) wrap.style.height = availH + 'px';
}
window.addEventListener('resize', sizeCanvas);

export function showMsg(m: string): void {
  s.msg = m;
  s.msgTimer = 120;
}

export function updateShopUI(): void {
  document.querySelectorAll('.tower-btn').forEach((b: Element) => {
    const btn = b as HTMLButtonElement;
    btn.classList.toggle(
      'selected',
      (s.selectedTower !== null && btn.dataset.id === s.selectedTower.id) ||
      (s.placingMine && btn.dataset.id === 'mine')
    );
  });
}

export function sellMode(): void {
  s.selling = !s.selling;
  s.selectedTower = null;
  s.placingMine = false;
  updateShopUI();
  showMsg(s.selling ? 'Click a tower to sell it' : '');
}

export function toggleFuse(): void {
  s.fuseMode = !s.fuseMode;
  s.fuseTarget = null;
  s.selling = false;
  s.selectedTower = null;
  s.placingMine = false;
  updateShopUI();
  const btn = document.getElementById('fuse-btn');
  if (btn) btn.classList.toggle('selected', s.fuseMode);
  showMsg(s.fuseMode ? '🔀 Select 1st tower to fuse' : '');
}

function getCanvasCell(e: MouseEvent | TouchEvent): { col: number; row: number } {
  const rect = C.getBoundingClientRect();
  let clientX: number, clientY: number;
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  }
  const col = Math.floor((clientX - rect.left) / rect.width * COLS);
  const row = Math.floor((clientY - rect.top) / rect.height * ROWS);
  return { col, row };
}

function handleCanvasInteraction(e: MouseEvent | TouchEvent): void {
  e.preventDefault();
  const { col, row } = getCanvasCell(e);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;

  if (s.fuseMode) {
    const clicked = s.towers.find(t => t.col === col && t.row === row);
    if (!clicked) { showMsg('Click an existing tower to fuse'); return; }
    if (!s.fuseTarget) {
      s.fuseTarget = clicked;
      showMsg('🔀 Now select 2nd tower to fuse with');
      return;
    }
    if (s.fuseTarget === clicked) { showMsg('Select a DIFFERENT tower!'); return; }
    const key = s.fuseTarget.def.id + '+' + clicked.def.id;
    const result = FUSION_DEFS[key];
    if (!result) { showMsg(`❌ These towers can't fuse! Try different combo.`); s.fuseTarget = null; return; }
    s.towers = s.towers.filter(t => t !== s.fuseTarget && t !== clicked);
    s.towers.push({
      col: s.fuseTarget.col,
      row: s.fuseTarget.row,
      x: s.fuseTarget.x,
      y: s.fuseTarget.y,
      def: result,
      cooldown: 0,
      angle: 0,
      fireFlash: 0,
      fused: true,
    });
    showMsg(`✨ FUSION! ${result.name} created!`);
    Sounds.fusion();
    s.fuseMode = false;
    s.fuseTarget = null;
    const btn = document.getElementById('fuse-btn');
    if (btn) btn.classList.remove('selected');
    updateShopUI();
    return;
  }

  if (s.selling) {
    const idx = s.towers.findIndex(t => t.col === col && t.row === row);
    if (idx >= 0) {
      const refund = Math.floor(s.towers[idx].def.cost * 0.6);
      s.money += refund;
      s.towers.splice(idx, 1);
      showMsg(`Sold for $${refund}`);
      s.selling = false;
    }
    return;
  }

  if (s.placingMine) {
    if (!pathSet.has(col + ',' + row)) { showMsg('Mines must be placed on the path!'); return; }
    if (s.mines.find(m => m.col === col && m.row === row)) { showMsg('Mine already here!'); return; }
    if (s.money < MINE_DEF.cost) { showMsg('Not enough credits!'); return; }
    s.money -= MINE_DEF.cost;
    s.mines.push({ col, row, x: col * TILE + TILE / 2, y: row * TILE + TILE / 2, armed: false, armTimer: 60, detonated: false, flashTimer: 0 });
    showMsg('Mine placed! Arms in 1 sec.');
    return;
  }

  if (!s.selectedTower) return;
  if (pathSet.has(col + ',' + row)) { showMsg("Can't build on the path!"); return; }
  if (s.towers.find(t => t.col === col && t.row === row)) { showMsg('Already occupied!'); return; }
  if (s.money < s.selectedTower.cost) { showMsg('Not enough credits!'); return; }
  s.money -= s.selectedTower.cost;
  s.towers.push({ col, row, x: col * TILE + TILE / 2, y: row * TILE + TILE / 2, def: s.selectedTower, cooldown: 0, angle: 0, fireFlash: 0 });
  Sounds.place();
}

C.addEventListener('click', handleCanvasInteraction as EventListener);
C.addEventListener('touchend', handleCanvasInteraction as EventListener, { passive: false });

export function startWave(): void {
  if (s.waveActive) return;
  s.waveNum++;
  s.waveActive = true;
  s.spawnQueue = [];

  if (s.waveNum >= 20) {
    const hpMult = 1 + (s.waveNum - 1) * 0.25;
    for (let b = 0; b < 2; b++) {
      const base = ENEMY_TYPES[7];
      s.spawnQueue.push({
        type: base,
        hp: Math.floor(base.hp * hpMult),
        maxHp: Math.floor(base.hp * hpMult),
        speed: base.speed,
        reward: base.reward,
        pathIdx: 0,
        x: PATH[0][0] * TILE + TILE / 2,
        y: PATH[0][1] * TILE + TILE / 2,
        slowTimer: 0,
        walkCycle: Math.random() * Math.PI * 2,
        facing: 0,
      });
    }
  }

  const count = 5 + s.waveNum * 3;
  for (let i = 0; i < count; i++) {
    let typeIdx = 0;
    if (s.waveNum >= 20 && Math.random() < 0.25) typeIdx = 8;
    else if (s.waveNum >= 20 && Math.random() < 0.12) typeIdx = 7;
    else if (s.waveNum >= 10 && Math.random() < 0.08) typeIdx = 6;
    else if (s.waveNum >= 7 && Math.random() < 0.15) typeIdx = 4;
    else if (s.waveNum >= 4 && Math.random() < 0.2) typeIdx = 3;
    else if (s.waveNum >= 5 && Math.random() < 0.25) typeIdx = 5;
    else if (s.waveNum >= 3 && Math.random() < 0.3) typeIdx = 2;
    else if (s.waveNum >= 2 && Math.random() < 0.4) typeIdx = 1;
    const base = ENEMY_TYPES[typeIdx];
    const hpMult = 1 + (s.waveNum - 1) * 0.25;
    s.spawnQueue.push({
      type: base,
      hp: Math.floor(base.hp * hpMult),
      maxHp: Math.floor(base.hp * hpMult),
      speed: base.speed,
      reward: base.reward,
      pathIdx: 0,
      x: PATH[0][0] * TILE + TILE / 2,
      y: PATH[0][1] * TILE + TILE / 2,
      slowTimer: 0,
      walkCycle: Math.random() * Math.PI * 2,
      facing: 0,
    });
  }
  s.spawnTimer = 0;
}

export function restartGame(): void {
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
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.remove('show');
}

export function setSpeed(n: number): void {
  s.gameSpeed = n;
  document.querySelectorAll('.spd-btn').forEach((b: Element) => {
    const btn = b as HTMLButtonElement;
    btn.classList.toggle('selected', +(btn.dataset.spd ?? '0') === n);
  });
}

// ── UPDATE LOOP ──────────────────────────────────────────────────────────────
export function update(): void {
  s.gameTime++;
  if (s.overclockTimer > 0) s.overclockTimer--;

  if (s.spawnQueue.length > 0) {
    s.spawnTimer--;
    if (s.spawnTimer <= 0) {
      s.enemies.push(s.spawnQueue.shift()!);
      s.spawnTimer = 18;
    }
  }

  s.enemies.forEach(e => {
    if (e.slowTimer > 0) e.slowTimer--;
    const spd = e.speed * (e.slowTimer > 0 ? 0.4 : 1);
    e.walkCycle += spd * 0.15;
    const target = PATH[e.pathIdx + 1];
    if (!target) { e.done = true; return; }
    const tx = target[0] * TILE + TILE / 2;
    const ty = target[1] * TILE + TILE / 2;
    const dx = tx - e.x, dy = ty - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0.1) e.facing = Math.atan2(dy, dx);
    if (dist < spd * 2) {
      e.pathIdx++;
      if (e.pathIdx >= PATH.length - 1) e.done = true;
    } else {
      e.x += (dx / dist) * spd;
      e.y += (dy / dist) * spd;
    }
  });

  s.mines.forEach(m => {
    if (m.detonated) return;
    if (!m.armed) {
      m.armTimer--;
      if (m.armTimer <= 0) m.armed = true;
      return;
    }
    let triggered = false;
    s.enemies.forEach(e => {
      if (Math.hypot(e.x - m.x, e.y - m.y) < 18) triggered = true;
    });
    if (triggered) {
      m.detonated = true;
      m.flashTimer = 12;
      s.enemies.forEach(e => {
        const d = Math.hypot(e.x - m.x, e.y - m.y);
        if (d < MINE_DEF.splashRadius) {
          const falloff = 1 - (d / MINE_DEF.splashRadius) * 0.5;
          e.hp -= Math.floor(MINE_DEF.damage * falloff);
        }
      });
      spawnMineExplosion(m.x, m.y);
    }
  });
  s.mines = s.mines.filter(m => !m.detonated || m.flashTimer > 0);
  s.mines.forEach(m => { if (m.flashTimer > 0) m.flashTimer--; });

  s.enemies = s.enemies.filter(e => {
    if (e.done) { s.lives--; Sounds.lifeLost(); return false; }
    if (e.hp <= 0) {
      s.score += e.reward;
      s.money += e.reward;
      spawnDeathExplosion(e.x, e.y, e.type.color, e.type.size);
      Sounds.explode(e.type.size);
      if (e.reward >= 200) {
        s.overclockTimer = 600;
        showMsg('⚡ OVERCLOCK! Towers supercharged for 10s!');
        Sounds.overclock();
      }
      return false;
    }
    return true;
  });

  s.towers.forEach(t => {
    if (t.fireFlash > 0) t.fireFlash--;
    if (t.cooldown > 0) { t.cooldown--; return; }
    let best: Enemy | null = null;
    s.enemies.forEach(e => {
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d <= t.def.range && e.pathIdx > (best ? best.pathIdx : -1)) best = e;
    });
    if (!best) return;
    t.angle = Math.atan2((best as Enemy).y - t.y, (best as Enemy).x - t.x);
    t.cooldown = s.overclockTimer > 0 ? Math.max(1, Math.floor(t.def.rate / 2)) : t.def.rate;
    Sounds.shoot(t.def.id);
    t.fireFlash = 5;

    if (t.def.chain) {
      const targets: Enemy[] = [best as Enemy];
      let remaining = [...s.enemies].filter(e => e !== best);
      for (let i = 1; i < t.def.chain; i++) {
        const last = targets[targets.length - 1];
        let closest: Enemy | null = null;
        let cd = Infinity;
        remaining.forEach(e => {
          const d = Math.hypot(e.x - last.x, e.y - last.y);
          if (d < 100 && d < cd) { closest = e; cd = d; }
        });
        if (closest) { targets.push(closest); remaining = remaining.filter(e => e !== closest); }
      }
      targets.forEach(tgt => {
        tgt.hp -= t.def.damage;
        spawnParticles(tgt.x, tgt.y, t.def.bulletColor, 3);
      });
      t.chainTargets = targets;
      t.chainTimer = 8;
    } else {
      s.bullets.push({
        x: t.x + Math.cos(t.angle) * 16,
        y: t.y + Math.sin(t.angle) * 16,
        tx: (best as Enemy).x,
        ty: (best as Enemy).y,
        target: best as Enemy,
        speed: t.def.bulletSpeed,
        damage: t.def.damage,
        color: t.def.bulletColor,
        splash: t.def.splash || 0,
        slow: t.def.slow || 0,
        pierce: t.def.pierce || false,
        homing: t.def.homing || false,
        trail: [],
        towerId: t.def.id,
      });
    }
  });

  s.towers.forEach(t => { if ((t.chainTimer ?? 0) > 0) t.chainTimer!--; });

  s.bullets.forEach(b => {
    if (b.target && b.target.hp > 0) {
      b.tx = b.target.x;
      b.ty = b.target.y;
    }
    b.trail.push({ x: b.x, y: b.y, life: 8 });
    const dx = b.tx - b.x, dy = b.ty - b.y;
    const d = Math.hypot(dx, dy);

    if (b.homing && d > b.speed * 3) {
      const targetAngle = Math.atan2(dy, dx);
      if (b.angle === undefined) b.angle = targetAngle;
      let diff = targetAngle - b.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      b.angle += diff * 0.12;
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      if (s.gameTime % 2 === 0) {
        s.particles.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, life: 10 + Math.random() * 8, color: '#888', size: 1.5 + Math.random(), gravity: -0.02 });
      }
    } else if (d < b.speed * 2) {
      b.hit = true;
      if (b.target && b.target.hp > 0) {
        b.target.hp -= b.damage;
        if (b.slow) b.target.slowTimer = 60;
      }
      if (b.splash > 0) {
        s.enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < b.splash) {
            e.hp -= Math.floor(b.damage * 0.5);
            if (b.slow) e.slowTimer = Math.max(e.slowTimer, 45);
          }
        });
        spawnParticles(b.tx, b.ty, b.color, 12);
      }
      if (b.pierce) {
        s.enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < 20) {
            e.hp -= Math.floor(b.damage * 0.5);
          }
        });
      }
      spawnParticles(b.tx, b.ty, b.color, 5);
    } else {
      b.x += (dx / d) * b.speed;
      b.y += (dy / d) * b.speed;
    }
  });
  s.bullets.forEach(b => { b.trail = b.trail.filter(t => { t.life--; return t.life > 0; }); });
  s.bullets = s.bullets.filter(b => !b.hit);

  s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vx *= 0.94; p.vy *= 0.94; p.vy += (p.gravity || 0); });
  s.particles = s.particles.filter(p => p.life > 0);

  if (s.waveActive && s.spawnQueue.length === 0 && s.enemies.length === 0) {
    s.waveActive = false;
    s.money += 25 + s.waveNum * 5;
    showMsg(`Wave ${s.waveNum} cleared! Bonus: $${25 + s.waveNum * 5}`);
    Sounds.waveDone();
  }

  const ocBar = document.getElementById('overclock-bar');
  const ocFill = document.getElementById('overclock-fill');
  if (ocBar && ocFill) {
    if (s.overclockTimer > 0) {
      ocBar.style.display = 'block';
      ocFill.style.width = (s.overclockTimer / 600 * 100) + '%';
    } else {
      ocBar.style.display = 'none';
    }
  }

  if (s.lives <= 0) {
    s.lives = 0;
    const ovTitle = document.getElementById('ov-title');
    const ovText = document.getElementById('ov-text');
    const overlay = document.getElementById('overlay');
    if (ovTitle) ovTitle.textContent = 'SYSTEM BREACH';
    if (ovText) ovText.textContent = `The robots broke through! Score: ${s.score} | Waves survived: ${s.waveNum - 1}`;
    if (overlay) overlay.classList.add('show');
  }
  if (s.msgTimer > 0) s.msgTimer--;
}

// Build shop UI
const shopEl = document.getElementById('shop')!;
TOWER_DEFS.forEach(t => {
  const btn = document.createElement('button');
  btn.className = 'tower-btn';
  btn.innerHTML = `<div class="name">${t.name}</div><div class="cost">$${t.cost}</div><div class="desc">${t.desc}</div>`;
  btn.onclick = () => { s.selling = false; s.placingMine = false; s.selectedTower = t; updateShopUI(); };
  btn.dataset.id = t.id;
  shopEl.appendChild(btn);
});

const mineBtn = document.createElement('button');
mineBtn.className = 'tower-btn';
mineBtn.innerHTML = `<div class="name" style="color:#f42">${MINE_DEF.name}</div><div class="cost">$${MINE_DEF.cost}</div><div class="desc">${MINE_DEF.desc}</div>`;
mineBtn.dataset.id = 'mine';
mineBtn.onclick = () => { s.selling = false; s.selectedTower = null; s.placingMine = true; updateShopUI(); };
shopEl.appendChild(mineBtn);

// Expose globals for HTML onclick handlers
declare global {
  interface Window {
    gameSpeed: number;
    _getGameSpeed: () => number;
    _getFuseMode: () => boolean;
    _getTowers: () => Tower[];
    _getEnemies: () => Enemy[];
  }
}
window.gameSpeed = s.gameSpeed;
window._getGameSpeed = () => s.gameSpeed;
window._getFuseMode = () => s.fuseMode;
window._getTowers = () => s.towers;
window._getEnemies = () => s.enemies;
