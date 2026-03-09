// wavepreview.ts — Shows upcoming wave composition for 2 seconds before wave starts
import type { MapDef } from './types';

let currentMapDef: MapDef | null = null;
let previewTimer: ReturnType<typeof setTimeout> | null = null;

export function setPreviewMap(m: MapDef): void {
  currentMapDef = m;
}

const ENEMY_ICONS: Record<string, string> = {
  Scout: '🤖',
  Soldier: '🛡',
  Tank: '🚜',
  Drone: '🚁',
  Mech: '⚔️',
  Swarm: '🐝',
  Titan: '💀',
  Juggernaut: '👹',
  Specter: '👻',
};

export function showWavePreview(waveIndex: number): void {
  if (!currentMapDef || waveIndex >= currentMapDef.waves.length) return;
  
  const wave = currentMapDef.waves[waveIndex];
  const nextWave = currentMapDef.waves[waveIndex + 1];
  
  // Remove old preview if any
  const old = document.getElementById('wave-preview');
  if (old) old.remove();

  const preview = document.createElement('div');
  preview.id = 'wave-preview';
  
  // Show current wave composition
  const parts = wave.enemies.map(g => `${ENEMY_ICONS[g.type] || '🤖'} ${g.type}×${g.count}`);
  preview.innerHTML = `<span>Wave ${waveIndex + 1}:</span> ${parts.join('  ')}`;
  
  // Insert into canvas-wrap
  const wrap = document.getElementById('canvas-wrap');
  if (wrap) {
    wrap.style.position = 'relative';
    wrap.appendChild(preview);
  }

  // Auto-remove after 2.5 seconds
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    const el = document.getElementById('wave-preview');
    if (el) el.remove();
  }, 2500);
}
