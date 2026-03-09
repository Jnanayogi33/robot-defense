// ambient.ts — Ambient background particles for world atmosphere

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

const ambientParticles: AmbientParticle[] = [];
const MAX_AMBIENT = 25;

let _worldId = 1;
let _canvasW = 720;
let _canvasH = 504;

export function setAmbientWorld(worldId: number, w: number, h: number): void {
  _worldId = worldId;
  _canvasW = w;
  _canvasH = h;
}

function spawnAmbient(): void {
  if (ambientParticles.length >= MAX_AMBIENT) return;
  
  let p: AmbientParticle;
  
  if (_worldId === 1) {
    // Urban ruins: orange embers floating upward
    p = {
      x: Math.random() * _canvasW,
      y: _canvasH + 5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.5),
      life: 180 + Math.random() * 120,
      maxLife: 300,
      size: 1 + Math.random() * 1.5,
      color: `hsl(${20 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`,
      alpha: 0.15 + Math.random() * 0.2,
    };
  } else if (_worldId === 2) {
    // Underground: blue water droplets falling
    p = {
      x: Math.random() * _canvasW,
      y: -5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: 0.4 + Math.random() * 0.6,
      life: 150 + Math.random() * 100,
      maxLife: 250,
      size: 1 + Math.random() * 1,
      color: `hsl(210, 80%, ${60 + Math.random() * 30}%)`,
      alpha: 0.12 + Math.random() * 0.15,
    };
  } else {
    // TITAN's ship: red sparks drifting
    p = {
      x: Math.random() * _canvasW,
      y: Math.random() * _canvasH,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.4,
      life: 80 + Math.random() * 60,
      maxLife: 140,
      size: 0.8 + Math.random() * 1,
      color: `hsl(${350 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
      alpha: 0.2 + Math.random() * 0.2,
    };
  }
  
  ambientParticles.push(p);
}

export function updateAmbient(): void {
  // Spawn occasionally
  if (Math.random() < 0.3) spawnAmbient();
  
  for (let i = ambientParticles.length - 1; i >= 0; i--) {
    const p = ambientParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    
    // Drift world 1 embers
    if (_worldId === 1) p.vx += (Math.random() - 0.5) * 0.05;
    
    // Remove when off-screen or dead
    if (p.life <= 0 || p.x < -5 || p.x > _canvasW + 5 || p.y < -5 || p.y > _canvasH + 5) {
      ambientParticles.splice(i, 1);
    }
  }
}

export function drawAmbient(ctx: CanvasRenderingContext2D): void {
  ambientParticles.forEach(p => {
    const fade = Math.min(1, p.life / 30) * Math.min(1, (p.maxLife - p.life) / 30 + 0.5);
    ctx.globalAlpha = p.alpha * fade;
    ctx.fillStyle = p.color;
    if (_worldId === 2) {
      // Droplets are elongated
      ctx.fillRect(p.x - p.size * 0.4, p.y - p.size, p.size * 0.8, p.size * 2);
    } else if (_worldId === 3) {
      // Sparks are bright points
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.shadowBlur = 0;
    } else {
      // Embers: small circles with glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  ctx.globalAlpha = 1;
}
