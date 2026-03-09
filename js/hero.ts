// hero.ts — ARIA-7 hero unit with EMP ability and level-up system
import { s } from './state';
import { ctx, C, showMsg } from './game';
import { TILE, PATH, pathSet } from './constants';
import { getSprite } from './sprites';
import type { Hero } from './types';

const EMP_COOLDOWN = 30 * 60; // 30 seconds at 60fps
const EMP_DURATION = 2 * 60;  // 2 seconds stun
const LEVEL_UP_WAVES = 3;

export function initHero(): void {
  // Place hero at a non-path starting position
  let hx = 3, hy = 1;
  // Find a non-path cell
  for (let col = 1; col < 5; col++) {
    for (let row = 1; row < 4; row++) {
      if (!pathSet.has(col + ',' + row)) {
        hx = col; hy = row; break;
      }
    }
  }
  s.hero = {
    x: hx * TILE + TILE / 2,
    y: hy * TILE + TILE / 2,
    hp: 50,
    maxHp: 50,
    level: 1,
    empCooldown: 0,
    shield: 0,
    retreating: false,
    retreatTimer: 0,
    dragging: false,
  };
}

let dragStart: { x: number; y: number } | null = null;
let hasDragged = false;

function getCanvasPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
  const rect = C.getBoundingClientRect();
  let cx: number, cy: number;
  if ('touches' in e && e.touches.length > 0) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else if ('changedTouches' in e && e.changedTouches.length > 0) {
    cx = e.changedTouches[0].clientX;
    cy = e.changedTouches[0].clientY;
  } else {
    cx = (e as MouseEvent).clientX;
    cy = (e as MouseEvent).clientY;
  }
  return {
    x: (cx - rect.left) / rect.width * (C.width),
    y: (cy - rect.top) / rect.height * (C.height),
  };
}

function isNearHero(px: number, py: number): boolean {
  if (!s.hero) return false;
  return Math.hypot(px - s.hero.x, py - s.hero.y) < TILE * 1.2;
}

export function setupHeroInputs(): void {
  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    if (!s.hero) return;
    const pos = getCanvasPos(e);
    if (isNearHero(pos.x, pos.y)) {
      dragStart = pos;
      hasDragged = false;
      s.hero.dragging = true;
    }
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (!s.hero || !dragStart) return;
    const pos = getCanvasPos(e);
    const dist = Math.hypot(pos.x - dragStart.x, pos.y - dragStart.y);
    if (dist > 5) hasDragged = true;
    if (hasDragged) {
      // Move hero to pointer position (but check path constraint)
      const col = Math.floor(pos.x / TILE);
      const row = Math.floor(pos.y / TILE);
      if (!pathSet.has(col + ',' + row) && col >= 0 && col < 20 && row >= 0 && row < 14) {
        s.hero.x = pos.x;
        s.hero.y = pos.y;
      }
    }
  };

  const onPointerUp = (e: MouseEvent | TouchEvent) => {
    if (!s.hero) return;
    s.hero.dragging = false;
    if (!hasDragged && dragStart) {
      // Tap = EMP ability
      fireEMP();
    }
    dragStart = null;
    hasDragged = false;
  };

  C.addEventListener('mousedown', onPointerDown as EventListener);
  C.addEventListener('mousemove', onPointerMove as EventListener);
  C.addEventListener('mouseup', onPointerUp as EventListener);
  C.addEventListener('touchstart', onPointerDown as EventListener, { passive: false });
  C.addEventListener('touchmove', onPointerMove as EventListener, { passive: false });
  C.addEventListener('touchend', onPointerUp as EventListener, { passive: false });
}

function fireEMP(): void {
  if (!s.hero) return;
  if (s.hero.empCooldown > 0) {
    showMsg(`EMP recharging... (${Math.ceil(s.hero.empCooldown / 60)}s)`);
    return;
  }
  s.hero.empCooldown = EMP_COOLDOWN;

  // Stun all enemies
  let count = 0;
  s.enemies.forEach(e => {
    e.slowTimer = EMP_DURATION * 2;
    e.speed = e.speed * 0.0; // freeze
    count++;
  });

  // Spawn EMP shockwave particle
  for (let r = 0; r < 3; r++) {
    s.particles.push({
      x: s.hero.x,
      y: s.hero.y,
      vx: 0, vy: 0,
      ring: true,
      ringR: 0,
      ringMax: 60 + r * 40,
      life: 20 - r * 3,
      maxLife: 20 - r * 3,
      color: '#aa44ff',
    });
  }

  // Floating EMP text
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    s.particles.push({
      x: s.hero.x, y: s.hero.y,
      vx: Math.cos(angle) * 2,
      vy: Math.sin(angle) * 2,
      life: 30,
      color: '#cc88ff',
      size: 2,
    });
  }

  showMsg(`⚡ EMP BLAST! ${count} robots stunned!`);
}

export function updateHero(): void {
  if (!s.hero) return;
  const h = s.hero;

  // Cooldown tick
  if (h.empCooldown > 0) h.empCooldown--;

  // Level up every LEVEL_UP_WAVES waves
  const expectedLevel = 1 + Math.floor(s.waveNum / LEVEL_UP_WAVES);
  if (expectedLevel > h.level) {
    h.level = expectedLevel;
    h.maxHp = 50 + (h.level - 1) * 20;
    h.hp = Math.min(h.hp + 30, h.maxHp);
    showMsg(`🎖 ARIA-7 Level Up! Level ${h.level}`);
    // Floating level up effect
    s.particles.push({
      x: h.x, y: h.y - 20,
      vx: 0, vy: -1,
      life: 60,
      color: '#ffdd00',
      size: 4,
    });
  }

  // Take damage from enemies that touch hero
  s.enemies.forEach(e => {
    const d = Math.hypot(e.x - h.x, e.y - h.y);
    if (d < TILE * 0.8 && !h.retreating) {
      h.hp -= 0.2;
      if (h.hp <= 0) {
        h.hp = 0;
        h.retreating = true;
        h.retreatTimer = 5 * 60; // 5 seconds
        showMsg('💔 ARIA-7 retreating! Back in 5s...');
      }
    }
  });

  // Retreat recovery
  if (h.retreating) {
    h.retreatTimer--;
    if (h.retreatTimer <= 0) {
      h.retreating = false;
      h.hp = Math.floor(h.maxHp * 0.6);
      const startPt = PATH[0];
      h.x = startPt[0] * TILE + TILE / 2;
      h.y = startPt[1] * TILE + TILE / 2;
      showMsg('✅ ARIA-7 back online!');
    }
  }
}

export function drawHero(): void {
  if (!s.hero) return;
  const h = s.hero;

  if (h.retreating) {
    // Draw retreating indicator at spawn
    if (s.gameTime % 30 < 15) {
      ctx.fillStyle = '#ff44aa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ARIA-7 retreating...', C.width / 2, 20);
    }
    return;
  }

  ctx.save();
  ctx.translate(h.x, h.y);

  const sprite = getSprite('hero-aria7');
  const sz = 28;

  // Draw hero
  if (sprite) {
    if (h.dragging) {
      ctx.shadowColor = '#44aaff';
      ctx.shadowBlur = 20;
    }
    ctx.drawImage(sprite, -sz / 2, -sz / 2, sz, sz);
    ctx.shadowBlur = 0;
  } else {
    // Canvas fallback: silver circle
    ctx.beginPath();
    ctx.arc(0, 0, sz / 2, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(0, -4, 2, 0, 0, sz / 2);
    grad.addColorStop(0, '#ccddff');
    grad.addColorStop(0.5, '#8899cc');
    grad.addColorStop(1, '#445566');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#aabbff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Blue core
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(68,170,255,${0.5 + Math.sin(s.gameTime * 0.1) * 0.3})`;
    ctx.fill();
  }

  // EMP cooldown arc
  if (h.empCooldown > 0) {
    const frac = 1 - h.empCooldown / EMP_COOLDOWN;
    ctx.beginPath();
    ctx.arc(0, 0, sz / 2 + 5, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.strokeStyle = '#aa44ff';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else {
    // Ready flash
    if (s.gameTime % 60 < 30) {
      ctx.beginPath();
      ctx.arc(0, 0, sz / 2 + 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(170,68,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  ctx.restore();

  // HP bar
  const bw = 30;
  const bh = 3;
  const by = h.y + sz / 2 + 6;
  ctx.fillStyle = '#300';
  ctx.fillRect(h.x - bw / 2, by, bw, bh);
  const hpRatio = h.hp / h.maxHp;
  ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00';
  ctx.fillRect(h.x - bw / 2, by, bw * hpRatio, bh);

  // Level label
  ctx.fillStyle = '#aabbff';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`ARIA-7 L${h.level}`, h.x, by + 12);
}
