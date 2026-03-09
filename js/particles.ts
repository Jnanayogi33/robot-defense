// particles.ts — particle system
import { s } from './state';
import type { Particle } from './types';

export function spawnParticles(x: number, y: number, color: string, count: number): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    s.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 15 + Math.random() * 15,
      color,
      size: 1 + Math.random() * 2,
    });
  }
}

export function spawnDeathExplosion(x: number, y: number, color: string, size: number): void {
  const isBig = size >= 18;
  const count = Math.floor(20 + size * 1.5);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * (isBig ? 7 : 4);
    const colors = [color, '#ff8', '#fa0', '#fff', '#f60', '#ff4'];
    s.particles.push({
      x: x + (Math.random() - 0.5) * size * 0.8,
      y: y + (Math.random() - 0.5) * size * 0.8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 18 + Math.random() * (isBig ? 35 : 22),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1.5 + Math.random() * (isBig ? 5 : 3),
      gravity: 0.06,
      glow: true,
    });
  }
  for (let i = 0; i < (isBig ? 12 : 5); i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * (isBig ? 4 : 2);
    s.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      life: 35 + Math.random() * 25,
      color: isBig ? '#555' : '#888',
      size: (isBig ? 4 : 2) + Math.random() * 3,
      gravity: 0.05,
    });
  }
  s.particles.push({
    x, y,
    vx: 0, vy: 0,
    ring: true,
    ringR: 0,
    ringMax: size * (isBig ? 3.5 : 2.5),
    life: isBig ? 18 : 12,
    maxLife: isBig ? 18 : 12,
    color,
  });
  for (let i = 0; i < (isBig ? 16 : 6); i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * (isBig ? 9 : 5);
    s.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 8 + Math.random() * 8,
      color: '#fff',
      size: 0.8 + Math.random() * 1.2,
      gravity: 0.2,
      spark: true,
    });
  }
}

export function spawnMineExplosion(x: number, y: number): void {
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    const colors = ['#f42', '#fa0', '#ff8', '#fff', '#f80', '#f60'];
    s.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 20 + Math.random() * 25,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      gravity: 0.06,
    });
  }
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 4;
    s.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 25 + Math.random() * 20,
      color: '#666',
      size: 1.5 + Math.random() * 2,
      gravity: 0.15,
    });
  }
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2;
    s.particles.push({
      x: x + (Math.random() - 0.5) * 15,
      y: y + (Math.random() - 0.5) * 15,
      vx: Math.cos(angle) * speed,
      vy: -0.5 - Math.random(),
      life: 35 + Math.random() * 20,
      color: '#555',
      size: 3 + Math.random() * 3,
      gravity: -0.03,
    });
  }
}
