// game.ts — Game logic, update loop, event handlers
import { s } from './state';
import { COLS, ROWS, TILE, TOWER_DEFS, MINE_DEF, FUSION_DEFS, ENEMY_TYPES, PATH, pathSet } from './constants';
import { spawnParticles, spawnDeathExplosion, spawnMineExplosion } from './particles';
import { Sounds, Music } from './audio';
import { TOWER_UPGRADES } from './data/tower-upgrades';
import { TOWER_SPRITE_MAP } from './sprites';
import type { TowerDef, Tower, Enemy } from './types';

// ── SMOOTH ROTATION HELPER ────────────────────────────────────────────────
export function lerpAngle(a: number, b: number, t: number): number {
  const diff = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return a + diff * t;
}

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

  // Tapping an existing tower opens upgrade panel
  const existingTower = s.towers.find(t => t.col === col && t.row === row);
  if (existingTower && !s.selling && !s.fuseMode && !s.placingMine) {
    showUpgradePanel(existingTower);
    return;
  }

  if (!s.selectedTower) return;
  if (pathSet.has(col + ',' + row)) { showMsg("Can't build on the path!"); return; }
  if (s.towers.find(t => t.col === col && t.row === row)) { showMsg('Already occupied!'); return; }
  if (s.money < s.selectedTower.cost) { showMsg('Not enough credits!'); return; }
  s.money -= s.selectedTower.cost;
  const newTower: Tower = { col, row, x: col * TILE + TILE / 2, y: row * TILE + TILE / 2, def: { ...s.selectedTower }, cooldown: 0, angle: 0, fireFlash: 0, level: 0, upgradePath: null, baseCost: s.selectedTower.cost };
  s.towers.push(newTower);
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
  s.floatingTexts = [];
  s.screenShake = 0;
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
    if (e.hitFlash !== undefined && e.hitFlash > 0) e.hitFlash--;
    if (e.stunTimer !== undefined && e.stunTimer > 0) { e.stunTimer--; return; } // EMP stun
    const spd = e.speed * (e.slowTimer > 0 ? 0.4 : 1);
    e.walkCycle += spd * 0.15;
    const flying = (e.type as any).flying;
    if (flying) {
      // Flying enemies move directly toward the path exit
      const exitPt = PATH[PATH.length - 1];
      const tx = exitPt[0] * TILE + TILE / 2;
      const ty = exitPt[1] * TILE + TILE / 2;
      const dx = tx - e.x, dy = ty - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.1) e.facing = Math.atan2(dy, dx);
      if (dist < spd * 3) { e.done = true; return; }
      e.x += (dx / dist) * spd;
      e.y += (dy / dist) * spd;
      e.pathIdx = Math.min(e.pathIdx + 1, PATH.length - 2); // track progress for targeting
    } else {
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

  const spawnsFromDeath: typeof s.enemies = [];

  s.enemies = s.enemies.filter(e => {
    if (e.done) { s.lives--; Sounds.lifeLost(); return false; }
    if (e.hp <= 0) {
      s.score += e.reward;
      s.money += e.reward;
      spawnDeathExplosion(e.x, e.y, e.type.color, e.type.size);
      Sounds.explode(e.type.size);
      // Floating gold text on kill
      s.floatingTexts.push({ x: e.x, y: e.y - e.type.size, text: `+$${e.reward}`, life: 45, vy: -1.2, color: '#f0c040' });
      // Screen shake on boss death
      if (e.type.size >= 18) s.screenShake = 10;
      if (e.reward >= 200) {
        s.overclockTimer = 600;
        showMsg('⚡ OVERCLOCK! Towers supercharged for 10s!');
        Sounds.overclock();
      }
      // Swarm splitting: spawn 2 Scouts on Swarm death
      if (e.type.name === 'Swarm') {
        const scoutType = ENEMY_TYPES.find(t => t.name === 'Scout')!;
        for (let si = 0; si < 2; si++) {
          spawnsFromDeath.push({
            type: scoutType,
            hp: scoutType.hp,
            maxHp: scoutType.hp,
            speed: scoutType.speed,
            reward: 5,
            pathIdx: Math.max(0, e.pathIdx - 1),
            x: e.x + (Math.random() - 0.5) * 10,
            y: e.y + (Math.random() - 0.5) * 10,
            slowTimer: 0,
            walkCycle: Math.random() * Math.PI * 2,
            facing: e.facing,
          });
        }
      }
      return false;
    }
    return true;
  });

  // Add Swarm spawn children
  s.enemies.push(...spawnsFromDeath);

  s.towers.forEach(t => {
    if (t.fireFlash > 0) t.fireFlash--;
    if (t.recoil !== undefined && t.recoil > 0) t.recoil *= 0.82;
    // Smooth angle interpolation toward target
    if (t.targetAngle !== undefined) {
      t.angle = lerpAngle(t.angle, t.targetAngle, 0.12);
    }
    if (t.cooldown > 0) { t.cooldown--; return; }
    let best: Enemy | null = null;
    s.enemies.forEach(e => {
      const flying = (e.type as any).flying;
      // Ground towers can't hit flying enemies
      if (flying && !t.def.hitsAir) return;
      const d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d <= t.def.range && e.pathIdx > (best ? best.pathIdx : -1)) best = e;
    });
    if (!best) return;
    t.targetAngle = Math.atan2((best as Enemy).y - t.y, (best as Enemy).x - t.x);
    t.cooldown = s.overclockTimer > 0 ? Math.max(1, Math.floor(t.def.rate / 2)) : t.def.rate;
    Sounds.shoot(t.def.id);
    t.fireFlash = 5;
    t.recoil = 1.0;

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
        tgt.hitFlash = 4;
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
        hitsAir: t.def.hitsAir || false,
        ignorArmor: t.def.ignoresArmor || false,
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
      function applyDamage(enemy: Enemy, dmg: number): void {
        const armored = (enemy.type as any).armored;
        const finalDmg = (armored && !b.ignorArmor) ? Math.floor(dmg * 0.5) : dmg;
        enemy.hp -= finalDmg;
        enemy.hitFlash = 4; // white flash on hit
      }
      if (b.target && b.target.hp > 0) {
        applyDamage(b.target, b.damage);
        if (b.slow) b.target.slowTimer = 60;
      }
      if (b.splash > 0) {
        s.enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < b.splash) {
            applyDamage(e, Math.floor(b.damage * 0.5));
            if (b.slow) e.slowTimer = Math.max(e.slowTimer, 45);
          }
        });
        spawnParticles(b.tx, b.ty, b.color, 12);
      }
      if (b.pierce) {
        s.enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < 20) {
            applyDamage(e, Math.floor(b.damage * 0.5));
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

  // Update floating texts
  s.floatingTexts.forEach(ft => { ft.y += ft.vy; ft.life--; });
  s.floatingTexts = s.floatingTexts.filter(ft => ft.life > 0);

  // Decay screen shake
  if (s.screenShake > 0) s.screenShake *= 0.82;

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

// ── UPGRADE PANEL ────────────────────────────────────────────────────────
let selectedTowerInst: Tower | null = null;

export function showUpgradePanel(tower: Tower): void {
  selectedTowerInst = tower;
  const upgrades = TOWER_UPGRADES[tower.def.id];
  if (!upgrades) { closeUpgradePanel(); return; }

  const panel = document.getElementById('upgrade-panel');
  const shop = document.getElementById('shop');
  const controls = document.getElementById('controls');

  if (!panel) {
    createUpgradePanel();
    showUpgradePanel(tower);
    return;
  }

  if (shop) shop.style.display = 'none';

  const level = tower.level ?? 0;
  const path = tower.upgradePath ?? null;

  const l1 = upgrades.L1;
  const l2a = upgrades.L2A;
  const l2b = upgrades.L2B;

  panel.innerHTML = `
    <div class="upg-header">
      <strong style="color:${tower.def.color}">${tower.def.name}</strong>
      <span class="upg-level">Level ${level}/2 ${path ? `(${path})` : ''}</span>
    </div>
    <div class="upg-range">Range: ${tower.def.range} | DMG: ${tower.def.damage}</div>
    ${level === 0 ? `
      <button class="upg-btn ${s.money < l1.cost ? 'disabled' : ''}" id="upg-l1" ${s.money < l1.cost ? 'disabled' : ''}>
        ⬆ ${l1.name}<br><small>$${l1.cost} — ${l1.desc}</small>
      </button>
    ` : '<div class="upg-done">✓ L1 Upgraded</div>'}
    ${level >= 1 && path === null ? `
      <button class="upg-btn ${s.money < l2a.cost ? 'disabled' : ''}" id="upg-l2a" ${s.money < l2a.cost ? 'disabled' : ''}>
        🅰 ${l2a.name}<br><small>$${l2a.cost} — ${l2a.desc}</small>
      </button>
      <button class="upg-btn ${s.money < l2b.cost ? 'disabled' : ''}" id="upg-l2b" ${s.money < l2b.cost ? 'disabled' : ''}>
        🅱 ${l2b.name}<br><small>$${l2b.cost} — ${l2b.desc}</small>
      </button>
    ` : ''}
    ${level >= 2 ? `<div class="upg-done">✓ Fully Upgraded (${path})</div>` : ''}
    <div class="upg-footer">
      <button class="upg-sell-btn" id="upg-sell">💰 Sell ($${Math.floor((tower.baseCost ?? tower.def.cost) * 0.6)})</button>
      <button class="upg-close-btn" id="upg-close">✕</button>
    </div>
  `;
  panel.style.display = 'block';

  const l1Btn = document.getElementById('upg-l1');
  if (l1Btn) l1Btn.onclick = () => { buyUpgrade(tower, 'L1'); };
  const l2aBtn = document.getElementById('upg-l2a');
  if (l2aBtn) l2aBtn.onclick = () => { buyUpgrade(tower, 'L2A'); };
  const l2bBtn = document.getElementById('upg-l2b');
  if (l2bBtn) l2bBtn.onclick = () => { buyUpgrade(tower, 'L2B'); };
  const sellBtn = document.getElementById('upg-sell');
  if (sellBtn) sellBtn.onclick = () => {
    const refund = Math.floor((tower.baseCost ?? tower.def.cost) * 0.6);
    s.money += refund;
    s.towers = s.towers.filter(t => t !== tower);
    showMsg(`Sold for $${refund}`);
    closeUpgradePanel();
  };
  const closeBtn = document.getElementById('upg-close');
  if (closeBtn) closeBtn.onclick = () => closeUpgradePanel();
}

function buyUpgrade(tower: Tower, upgradeKey: 'L1' | 'L2A' | 'L2B'): void {
  const upgrades = TOWER_UPGRADES[tower.def.id];
  if (!upgrades) return;
  const upgrade = upgrades[upgradeKey];
  if (s.money < upgrade.cost) { showMsg('Not enough credits!'); return; }
  s.money -= upgrade.cost;
  
  // Apply upgrade to a deep copy of the def
  const newDef = { ...tower.def };
  upgrade.apply(newDef);
  tower.def = newDef;
  
  if (upgradeKey === 'L1') {
    tower.level = 1;
    tower.upgradeGlow = '#aaffaa';
  } else if (upgradeKey === 'L2A') {
    tower.level = 2;
    tower.upgradePath = 'A';
    tower.upgradeGlow = '#ffaaff';
  } else {
    tower.level = 2;
    tower.upgradePath = 'B';
    tower.upgradeGlow = '#ffffaa';
  }
  
  showMsg(`${upgrade.name} upgraded!`);
  Sounds.place();
  showUpgradePanel(tower); // refresh
}

function createUpgradePanel(): void {
  const panel = document.createElement('div');
  panel.id = 'upgrade-panel';
  panel.style.display = 'none';
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.insertBefore(panel, document.getElementById('controls'));
}

export function closeUpgradePanel(): void {
  selectedTowerInst = null;
  const panel = document.getElementById('upgrade-panel');
  if (panel) panel.style.display = 'none';
  const shop = document.getElementById('shop');
  if (shop) shop.style.display = '';
}

// Build shop UI with DALL-E sprites
const shopEl = document.getElementById('shop')!;

function makeTowerCard(t: TowerDef, id: string, spriteName: string | null, color: string, name: string, cost: number, desc: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'tower-btn';
  btn.dataset.id = id;

  // Create sprite container + text layout
  const spriteEl = document.createElement('div');
  spriteEl.className = 'tower-btn-sprite';
  spriteEl.style.cssText = `width:42px;height:42px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:4px;overflow:hidden;background:${color}22;border:1px solid ${color}44;position:relative;`;

  if (spriteName) {
    // Use DALL-E sprite image in shop (looks great at ~42px in a card)
    const img = document.createElement('img');
    const base = (import.meta.env.BASE_URL || '/robot-defense/').replace(/\/$/, '');
    img.src = `${base}/assets/sprites/${spriteName}.png`;
    img.style.cssText = 'width:42px;height:42px;object-fit:cover;image-rendering:pixelated;';
    img.onerror = () => {
      // Fallback: colored circle
      spriteEl.style.background = `radial-gradient(circle, ${color} 0%, ${color}33 100%)`;
    };
    spriteEl.appendChild(img);
  } else {
    spriteEl.style.background = `radial-gradient(circle, ${color} 0%, ${color}22 100%)`;
  }

  // Glow border on hover
  const textEl = document.createElement('div');
  textEl.className = 'tower-btn-text';
  textEl.innerHTML = `
    <div class="name" style="color:${color}">${name}</div>
    <div class="cost">$${cost}</div>
    <div class="desc">${desc}</div>
  `;

  btn.appendChild(spriteEl);
  btn.appendChild(textEl);
  btn.onclick = onClick;
  return btn;
}

TOWER_DEFS.forEach(t => {
  const spriteName = TOWER_SPRITE_MAP[t.id] ?? null;
  const btn = makeTowerCard(t, t.id, spriteName, t.color, t.name, t.cost, t.desc,
    () => { s.selling = false; s.placingMine = false; s.selectedTower = t; updateShopUI(); }
  );
  shopEl.appendChild(btn);
});

const mineBtn = makeTowerCard(
  {} as TowerDef, 'mine', null, '#f42', MINE_DEF.name, MINE_DEF.cost, MINE_DEF.desc,
  () => { s.selling = false; s.selectedTower = null; s.placingMine = true; updateShopUI(); }
);
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
