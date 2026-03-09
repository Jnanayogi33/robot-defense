// main.ts — Entry point for the game
import { s } from './state';
import { sizeCanvas, update, startWave, restartGame, sellMode, toggleFuse, setSpeed, updateShopUI } from './game';
import { draw } from './draw';
import { Music } from './audio';

// Expose globals for HTML onclick handlers
(window as any).startWave = startWave;
(window as any).restartGame = restartGame;
(window as any).sellMode = sellMode;
(window as any).toggleFuse = toggleFuse;
(window as any).setSpeed = setSpeed;
(window as any).Music = Music;

// Initialize canvas size
sizeCanvas();

// Game loop
function loop(): void {
  for (let i = 0; i < s.gameSpeed; i++) {
    if (s.lives > 0) update();
  }
  draw();
  requestAnimationFrame(loop);
}

loop();

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/robot-defense/sw.js', { updateViaCache: 'none' })
      .then(() => console.log('SW registered'))
      .catch(e => console.log('SW error:', e));
  });
}
