const C = document.getElementById('c');
const ctx = C.getContext('2d');

function sizeCanvas() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 8;
  // Sidebar is fixed narrow — 200px max
  const sidebarW = Math.min(200, vw * 0.24);
  const availH = vh - padding;
  // Width-driven: fills horizontal space, clips bottom ~2 empty rows of grid
  const scaleByW = (vw - sidebarW - padding) / COLS;
  const scale = scaleByW;
  const cssW = Math.floor(scale * COLS);
  const cssH = Math.floor(scale * ROWS);
  C.style.width  = cssW + 'px';
  C.style.height = cssH + 'px';
  // Set clip wrapper height to viewport
  const wrap = document.getElementById('canvas-wrap');
  if (wrap) wrap.style.height = availH + 'px';
}
window.addEventListener('resize', sizeCanvas);

const COLS = 20, ROWS = 14, TILE = 36;
C.width = COLS * TILE;
C.height = ROWS * TILE;


let gameTime = 0;
let money = 200, lives = 20, waveNum = 0, score = 0;
window.gameSpeed = 1; let gameSpeed = 1, overclockTimer = 0;
window._getGameSpeed = () => gameSpeed;
window._getFuseMode = () => fuseMode;
window._getTowers = () => towers;
window._getEnemies = () => enemies;
let selectedTower = null, selling = false, waveActive = false;
let towers = [], enemies = [], bullets = [], particles = [], spawnQueue = [], mines = [];
let spawnTimer = 0, msg = '', msgTimer = 0;

const PATH_POINTS = [
  [0,3],[4,3],[4,7],[10,7],[10,2],[15,2],[15,10],[19,10]
];

function buildPath() {
  let path = [];
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    let [x1,y1] = PATH_POINTS[i], [x2,y2] = PATH_POINTS[i+1];
    let dx = Math.sign(x2-x1), dy = Math.sign(y2-y1);
    let cx = x1, cy = y1;
    while (cx !== x2 || cy !== y2) {
      path.push([cx, cy]);
      if (cx !== x2) cx += dx;
      else cy += dy;
    }
  }
  path.push(PATH_POINTS[PATH_POINTS.length-1]);
  return path;
}
const PATH = buildPath();
const pathSet = new Set(PATH.map(p => p[0]+','+p[1]));

const TOWER_DEFS = [
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

const MINE_DEF = { id:'mine', name:'Proximity Mine', cost:40, color:'#f42', damage:80, splashRadius:50,
  desc:'Place on road' };

// ── FUSION TOWER DEFINITIONS ──────────────────────────────────────────────────
const FUSION_DEFS = {
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
let fuseMode = false, fuseTarget = null;
function toggleFuse() {
  fuseMode = !fuseMode; fuseTarget = null; selling = false; selectedTower = null; placingMine = false;
  updateShopUI();
  const btn = document.getElementById('fuse-btn');
  if (btn) btn.classList.toggle('selected', fuseMode);
  showMsg(fuseMode ? '🔀 Select 1st tower to fuse' : '');
}


const ENEMY_TYPES = [
  { name:'Scout', hp:30, speed:1.8, reward:10, color:'#f44', size:6 },
  { name:'Soldier', hp:80, speed:1.2, reward:20, color:'#fa0', size:8 },
  { name:'Tank', hp:200, speed:0.7, reward:40, color:'#a44', size:11 },
  { name:'Drone', hp:50, speed:2.5, reward:15, color:'#4af', size:5 },
  { name:'Mech', hp:500, speed:0.5, reward:80, color:'#f4f', size:18 },
  { name:'Swarm', hp:20, speed:2.2, reward:5, color:'#4f4', size:4 },
  { name:'Titan', hp:1500, speed:0.35, reward:200, color:'#fff', size:22 },
  { name:'Juggernaut', hp:6000, speed:0.18, reward:600, color:'#ff2244', size:30 },
  { name:'Specter', hp:900, speed:5.0, reward:400, color:'#88ffee', size:7 },
];

let placingMine = false;

const shopEl = document.getElementById('shop');
TOWER_DEFS.forEach(t => {
  let btn = document.createElement('button');
  btn.className = 'tower-btn';
  btn.innerHTML = `<div class="name">${t.name}</div><div class="cost">$${t.cost}</div><div class="desc">${t.desc}</div>`;
  btn.onclick = () => { selling = false; placingMine = false; selectedTower = t; updateShopUI(); };
  btn.dataset.id = t.id;
  shopEl.appendChild(btn);
});
let mineBtn = document.createElement('button');
mineBtn.className = 'tower-btn';
mineBtn.innerHTML = `<div class="name" style="color:#f42">${MINE_DEF.name}</div><div class="cost">$${MINE_DEF.cost}</div><div class="desc">${MINE_DEF.desc}</div>`;
mineBtn.dataset.id = 'mine';
mineBtn.onclick = () => { selling = false; selectedTower = null; placingMine = true; updateShopUI(); };
shopEl.appendChild(mineBtn);

function updateShopUI() {
  document.querySelectorAll('.tower-btn').forEach(b => {
    b.classList.toggle('selected', (selectedTower && b.dataset.id === selectedTower.id) || (placingMine && b.dataset.id === 'mine'));
  });
}
function showMsg(m) { msg = m; msgTimer = 120; }
function sellMode() { selling = !selling; selectedTower = null; placingMine = false; updateShopUI(); showMsg(selling ? 'Click a tower to sell it' : ''); }

// Unified coordinate handler for click and touch
function getCanvasCell(e) {
  let rect = C.getBoundingClientRect();
  let clientX, clientY;
  if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  let col = Math.floor((clientX - rect.left) / rect.width * COLS);
  let row = Math.floor((clientY - rect.top) / rect.height * ROWS);
  return { col, row };
}

function handleCanvasInteraction(e) {
  e.preventDefault();
  let { col, row } = getCanvasCell(e);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
  // Fusion mode
  if (fuseMode) {
    let clicked = towers.find(t => t.col === col && t.row === row);
    if (!clicked) { showMsg('Click an existing tower to fuse'); return; }
    if (!fuseTarget) {
      fuseTarget = clicked;
      showMsg('🔀 Now select 2nd tower to fuse with');
      return;
    }
    if (fuseTarget === clicked) { showMsg('Select a DIFFERENT tower!'); return; }
    let key = fuseTarget.def.id + '+' + clicked.def.id;
    let result = FUSION_DEFS[key];
    if (!result) { showMsg(`❌ These towers can't fuse! Try different combo.`); fuseTarget = null; return; }
    // Remove both towers, place fusion at first location
    towers = towers.filter(t => t !== fuseTarget && t !== clicked);
    towers.push({ col: fuseTarget.col, row: fuseTarget.row, x: fuseTarget.x, y: fuseTarget.y,
      def: result, cooldown: 0, angle: 0, fireFlash: 0, fused: true });
    showMsg(`✨ FUSION! ${result.name} created!`);
    Sounds.fusion();
    fuseMode = false; fuseTarget = null;
    const btn = document.getElementById('fuse-btn');
    if (btn) btn.classList.remove('selected');
    updateShopUI();
    return;
  }
  if (selling) {
    let idx = towers.findIndex(t => t.col === col && t.row === row);
    if (idx >= 0) {
      let refund = Math.floor(towers[idx].def.cost * 0.6);
      money += refund;
      towers.splice(idx, 1);
      showMsg(`Sold for $${refund}`);
      selling = false;
    }
    return;
  }
  if (placingMine) {
    if (!pathSet.has(col+','+row)) { showMsg('Mines must be placed on the path!'); return; }
    if (mines.find(m => m.col === col && m.row === row)) { showMsg('Mine already here!'); return; }
    if (money < MINE_DEF.cost) { showMsg('Not enough credits!'); return; }
    money -= MINE_DEF.cost;
    mines.push({
      col, row,
      x: col * TILE + TILE/2,
      y: row * TILE + TILE/2,
      armed: false,
      armTimer: 60,
      detonated: false,
      flashTimer: 0
    });
    showMsg('Mine placed! Arms in 1 sec.');
    return;
  }
  if (!selectedTower) return;
  if (pathSet.has(col+','+row)) { showMsg("Can't build on the path!"); return; }
  if (towers.find(t => t.col === col && t.row === row)) { showMsg('Already occupied!'); return; }
  if (money < selectedTower.cost) { showMsg('Not enough credits!'); return; }
  money -= selectedTower.cost;
  towers.push({
    col, row,
    x: col * TILE + TILE/2,
    y: row * TILE + TILE/2,
    def: selectedTower,
    cooldown: 0,
    angle: 0,
    fireFlash: 0
  });
  Sounds.place();
}

C.addEventListener('click', handleCanvasInteraction);
C.addEventListener('touchend', handleCanvasInteraction, { passive: false });

function startWave() {
  if (waveActive) return;
  waveNum++;
  waveActive = true;
  spawnQueue = [];
  // Wave 20+: guarantee boss robots in the wave
  if (waveNum >= 20) {
    let hpMult = 1 + (waveNum - 1) * 0.25;
    for (let b = 0; b < 2; b++) {
      let base = ENEMY_TYPES[7]; // Juggernaut
      spawnQueue.push({ ...base, hp: Math.floor(base.hp * hpMult), maxHp: Math.floor(base.hp * hpMult), progress: 0, done: false, id: Math.random() });
    }
  }
  let count = 5 + waveNum * 3;
  for (let i = 0; i < count; i++) {
    let typeIdx;
    if (waveNum >= 20 && Math.random() < 0.25) typeIdx = 8; // Specter
    else if (waveNum >= 20 && Math.random() < 0.12) typeIdx = 7; // Juggernaut
    else if (waveNum >= 10 && Math.random() < 0.08) typeIdx = 6;
    else if (waveNum >= 7 && Math.random() < 0.15) typeIdx = 4;
    else if (waveNum >= 4 && Math.random() < 0.2) typeIdx = 3;
    else if (waveNum >= 5 && Math.random() < 0.25) typeIdx = 5;
    else if (waveNum >= 3 && Math.random() < 0.3) typeIdx = 2;
    else if (waveNum >= 2 && Math.random() < 0.4) typeIdx = 1;
    else typeIdx = 0;
    let base = ENEMY_TYPES[typeIdx];
    let hpMult = 1 + (waveNum - 1) * 0.25;
    spawnQueue.push({
      type: base,
      hp: Math.floor(base.hp * hpMult),
      maxHp: Math.floor(base.hp * hpMult),
      speed: base.speed,
      reward: base.reward,
      pathIdx: 0,
      x: PATH[0][0] * TILE + TILE/2,
      y: PATH[0][1] * TILE + TILE/2,
      slowTimer: 0,
      walkCycle: Math.random() * Math.PI * 2,
      facing: 0
    });
  }
  spawnTimer = 0;
}

function restartGame() {
  money = 200; lives = 20; waveNum = 0; score = 0;
  towers = []; enemies = []; bullets = []; particles = []; spawnQueue = []; mines = [];
  waveActive = false; selectedTower = null; selling = false; placingMine = false;
  document.getElementById('overlay').classList.remove('show');
}

// ============ UPDATE ============
function update() {
  gameTime++;
  if (overclockTimer > 0) overclockTimer--;

  if (spawnQueue.length > 0) {
    spawnTimer--;
    if (spawnTimer <= 0) {
      enemies.push(spawnQueue.shift());
      spawnTimer = 18;
    }
  }

  enemies.forEach(e => {
    if (e.slowTimer > 0) e.slowTimer--;
    let spd = e.speed * (e.slowTimer > 0 ? 0.4 : 1);
    e.walkCycle += spd * 0.15;
    let target = PATH[e.pathIdx + 1];
    if (!target) { e.done = true; return; }
    let tx = target[0] * TILE + TILE/2, ty = target[1] * TILE + TILE/2;
    let dx = tx - e.x, dy = ty - e.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 0.1) e.facing = Math.atan2(dy, dx);
    if (dist < spd * 2) {
      e.pathIdx++;
      if (e.pathIdx >= PATH.length - 1) e.done = true;
    } else {
      e.x += (dx/dist) * spd;
      e.y += (dy/dist) * spd;
    }
  });

  mines.forEach(m => {
    if (m.detonated) return;
    if (!m.armed) {
      m.armTimer--;
      if (m.armTimer <= 0) m.armed = true;
      return;
    }
    let triggered = false;
    enemies.forEach(e => {
      if (Math.hypot(e.x - m.x, e.y - m.y) < 18) triggered = true;
    });
    if (triggered) {
      m.detonated = true;
      m.flashTimer = 12;
      enemies.forEach(e => {
        let d = Math.hypot(e.x - m.x, e.y - m.y);
        if (d < MINE_DEF.splashRadius) {
          let falloff = 1 - (d / MINE_DEF.splashRadius) * 0.5;
          e.hp -= Math.floor(MINE_DEF.damage * falloff);
        }
      });
      spawnMineExplosion(m.x, m.y);
    }
  });
  mines = mines.filter(m => !m.detonated || m.flashTimer > 0);
  mines.forEach(m => { if (m.flashTimer > 0) m.flashTimer--; });

  enemies = enemies.filter(e => {
    if (e.done) { lives--; Sounds.lifeLost(); return false; }
    if (e.hp <= 0) {
      score += e.reward; money += e.reward;
      spawnDeathExplosion(e.x, e.y, e.type.color, e.type.size);
      Sounds.explode(e.type.size);
      if (e.reward >= 200) {
        overclockTimer = 600;
        showMsg('⚡ OVERCLOCK! Towers supercharged for 10s!');
        Sounds && Sounds.overclock();
      }
      return false;
    }
    return true;
  });

  towers.forEach(t => {
    if (t.fireFlash > 0) t.fireFlash--;
    if (t.cooldown > 0) { t.cooldown--; return; }
    let best = null;
    enemies.forEach(e => {
      let d = Math.hypot(e.x - t.x, e.y - t.y);
      if (d <= t.def.range && e.pathIdx > (best ? best.pathIdx : -1)) best = e;
    });
    if (!best) return;
    t.angle = Math.atan2(best.y - t.y, best.x - t.x);
    t.cooldown = overclockTimer > 0 ? Math.max(1, Math.floor(t.def.rate / 2)) : t.def.rate;
    Sounds.shoot(t.def.id);
    t.fireFlash = 5;

    if (t.def.chain) {
      let targets = [best];
      let remaining = [...enemies].filter(e => e !== best);
      for (let i = 1; i < t.def.chain; i++) {
        let last = targets[targets.length - 1];
        let closest = null, cd = Infinity;
        remaining.forEach(e => {
          let d = Math.hypot(e.x - last.x, e.y - last.y);
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
      bullets.push({
        x: t.x + Math.cos(t.angle) * 16,
        y: t.y + Math.sin(t.angle) * 16,
        tx: best.x, ty: best.y,
        target: best,
        speed: t.def.bulletSpeed,
        damage: t.def.damage,
        color: t.def.bulletColor,
        splash: t.def.splash || 0,
        slow: t.def.slow || 0,
        pierce: t.def.pierce || false,
        homing: t.def.homing || false,
        trail: [],
        towerId: t.def.id
      });
    }
  });

  towers.forEach(t => { if (t.chainTimer > 0) t.chainTimer--; });

  bullets.forEach(b => {
    if (b.target && b.target.hp > 0) {
      b.tx = b.target.x; b.ty = b.target.y;
    }
    b.trail.push({x: b.x, y: b.y, life: 8});
    let dx = b.tx - b.x, dy = b.ty - b.y;
    let d = Math.hypot(dx, dy);

    if (b.homing && d > b.speed * 3) {
      let targetAngle = Math.atan2(dy, dx);
      if (b.angle === undefined) b.angle = targetAngle;
      let diff = targetAngle - b.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      b.angle += diff * 0.12;
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      if (gameTime % 2 === 0) {
        particles.push({ x: b.x, y: b.y, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
          life: 10 + Math.random()*8, color: '#888', size: 1.5 + Math.random(), gravity: -0.02 });
      }
    } else if (d < b.speed * 2) {
      b.hit = true;
      if (b.target && b.target.hp > 0) {
        b.target.hp -= b.damage;
        if (b.slow) b.target.slowTimer = 60;
      }
      if (b.splash > 0) {
        enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < b.splash) {
            e.hp -= Math.floor(b.damage * 0.5);
            if (b.slow) e.slowTimer = Math.max(e.slowTimer, 45);
          }
        });
        spawnParticles(b.tx, b.ty, b.color, 12);
      }
      if (b.pierce) {
        enemies.forEach(e => {
          if (e !== b.target && Math.hypot(e.x - b.tx, e.y - b.ty) < 20) {
            e.hp -= Math.floor(b.damage * 0.5);
          }
        });
      }
      spawnParticles(b.tx, b.ty, b.color, 5);
    } else {
      b.x += (dx/d) * b.speed;
      b.y += (dy/d) * b.speed;
    }
  });
  bullets.forEach(b => b.trail = b.trail.filter(t => { t.life--; return t.life > 0; }));
  bullets = bullets.filter(b => !b.hit);

  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vx *= 0.94; p.vy *= 0.94; p.vy += (p.gravity || 0); });
  particles = particles.filter(p => p.life > 0);

  if (waveActive && spawnQueue.length === 0 && enemies.length === 0) {
    waveActive = false;
    money += 25 + waveNum * 5;
    showMsg(`Wave ${waveNum} cleared! Bonus: $${25 + waveNum * 5}`);
    Sounds.waveDone();
  }

  // Overclock HUD
  const ocBar = document.getElementById('overclock-bar');
  const ocFill = document.getElementById('overclock-fill');
  if (ocBar && ocFill) {
    if (overclockTimer > 0) {
      ocBar.style.display = 'block';
      ocFill.style.width = (overclockTimer / 600 * 100) + '%';
    } else { ocBar.style.display = 'none'; }
  }

  if (lives <= 0) {
    lives = 0;
    document.getElementById('ov-title').textContent = 'SYSTEM BREACH';
    document.getElementById('ov-text').textContent = `The robots broke through! Score: ${score} | Waves survived: ${waveNum - 1}`;
    document.getElementById('overlay').classList.add('show');
  }
  if (msgTimer > 0) msgTimer--;
}