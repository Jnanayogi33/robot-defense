// draw.ts — All drawing functions
import { s } from './state';
import { ctx, C } from './game';
import { COLS, ROWS, TILE, PATH, pathSet } from './constants';
import type { Tower, Enemy, Mine, Particle, Bullet } from './types';

// ============ DRAW HELPERS ============
function hexColor(hex: string, alpha: number): string {
  let r = parseInt(hex.slice(1,3),16)||parseInt(hex.slice(1,2),16)*17;
  let g = parseInt(hex.slice(3,5),16)||parseInt(hex.slice(2,3),16)*17;
  let b = parseInt(hex.slice(5,7),16)||parseInt(hex.slice(3,4),16)*17;
  if (hex.length === 4) {
    r = parseInt(hex[1],16)*17; g = parseInt(hex[2],16)*17; b = parseInt(hex[3],16)*17;
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

// ============ DRAW TOWERS ============
function drawTower(t: Tower): void {
  let cx = t.x, cy = t.y;
  let id = t.def.id;
  let col = t.def.color;
  let flash = t.fireFlash > 0;

  ctx.save();
  ctx.translate(cx, cy);

  let grad = ctx.createRadialGradient(0, 2, 2, 0, 0, 16);
  grad.addColorStop(0, '#3a3a4a');
  grad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-14, -10); ctx.lineTo(14, -10); ctx.lineTo(16, -6);
  ctx.lineTo(16, 10); ctx.lineTo(-16, 10); ctx.lineTo(-16, -6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#666';
  [[-11,-7],[11,-7],[-11,7],[11,7]].forEach(([bx,by]) => {
    ctx.beginPath(); ctx.arc(bx,by,1.5,0,Math.PI*2); ctx.fill();
  });

  ctx.fillStyle = '#2a2a3a';
  ctx.fillRect(-12, -4, 24, 4);
  ctx.strokeStyle = '#444';
  ctx.strokeRect(-12, -4, 24, 4);

  if (id === 'laser') {
    ctx.fillStyle = '#333';
    ctx.fillRect(-6, -8, 12, 6);
    ctx.fillStyle = '#444';
    ctx.fillRect(-8, -3, 16, 3);
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.moveTo(-8, -6); ctx.lineTo(6, -4); ctx.lineTo(14, -2);
    ctx.lineTo(14, 2); ctx.lineTo(6, 4); ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a6a8a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#556';
    ctx.fillRect(8, -2, 10, 4);
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.fillRect(16, -1.5, 3, 3);
    ctx.beginPath();
    ctx.arc(18, 0, 2, 0, Math.PI*2);
    ctx.fillStyle = flash ? '#fff' : col;
    ctx.fill();
    if (flash) {
      ctx.shadowColor = col;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = '#3a5a7a';
    ctx.beginPath(); ctx.moveTo(-2,-5); ctx.lineTo(-2,5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4,-3.5); ctx.lineTo(4,3.5); ctx.stroke();
    ctx.fillStyle = '#0f0';
    ctx.beginPath(); ctx.arc(-4, -3, 1.2, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'plasma') {
    ctx.fillStyle = '#2a1a2a';
    ctx.fillRect(-8, -8, 16, 6);
    ctx.fillStyle = '#3a2a3a';
    ctx.beginPath();
    ctx.arc(0, -5, 7, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#3a2040';
    ctx.beginPath();
    ctx.moveTo(-9, -7); ctx.lineTo(8, -6); ctx.lineTo(12, -3);
    ctx.lineTo(12, 3); ctx.lineTo(8, 6); ctx.lineTo(-9, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a3a6a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#4a3050';
    ctx.fillRect(8, -5, 10, 3);
    ctx.fillRect(8, 2, 10, 3);
    ctx.fillStyle = flash ? '#fff' : '#c0f';
    ctx.beginPath(); ctx.arc(18, -3.5, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, 3.5, 2, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(18, 0, 4, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#2a1a2a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-6 + i*5, -7.5, 2, 1.5);
      ctx.fillRect(-6 + i*5, 6, 2, 1.5);
    }
    ctx.fillStyle = hexColor('#f0f', 0.3 + Math.sin(s.gameTime*0.1)*0.2);
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'emp') {
    ctx.fillStyle = '#3a3a20';
    ctx.fillRect(-4, -12, 8, 10);
    ctx.fillStyle = '#4a4a30';
    ctx.fillRect(-6, -4, 12, 4);
    for (let i = 0; i < 3; i++) {
      let ry = -12 + i * 3;
      let pulse = Math.sin(s.gameTime * 0.08 + i) * 0.3 + 0.7;
      ctx.strokeStyle = hexColor('#ff0', pulse * 0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, ry, 10 - i, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    let empPulse = Math.sin(s.gameTime * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = hexColor('#ff0', empPulse);
    ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#aa0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -14, 2, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(0, -14, 6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexColor('#ff0', 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15 + (5 - t.fireFlash) * 8, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.fillStyle = '#aa0';
    ctx.fillRect(-8, 8, 4, 2);
    ctx.fillRect(4, 8, 4, 2);

  } else if (id === 'rail') {
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-8, -6, 16, 8);
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.arc(0, -3, 8, Math.PI, 0); ctx.fill();
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.moveTo(-10, -5); ctx.lineTo(4, -4);
    ctx.lineTo(22, -2.5); ctx.lineTo(22, 2.5);
    ctx.lineTo(4, 4); ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#654';
    ctx.fillRect(4, -4.5, 18, 2);
    ctx.fillRect(4, 2.5, 18, 2);
    ctx.strokeStyle = '#f84';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      let rx = 6 + i * 3.5;
      ctx.beginPath();
      ctx.moveTo(rx, -5); ctx.lineTo(rx, 5);
      ctx.stroke();
    }
    ctx.fillStyle = flash ? '#fff' : '#f60';
    ctx.beginPath(); ctx.arc(22, 0, 3, 0, Math.PI*2); ctx.fill();
    if (flash) {
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#f84';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        let a = (i/4)*Math.PI*2 + s.gameTime*0.3;
        ctx.beginPath();
        ctx.moveTo(22 + Math.cos(a)*3, Math.sin(a)*3);
        ctx.lineTo(22 + Math.cos(a)*8, Math.sin(a)*8);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-8, -3, 6, 6);
    ctx.fillStyle = flash ? '#fa0' : '#853';
    ctx.fillRect(-7, -2, 4, 4);
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.beginPath(); ctx.arc(-5, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.restore();

  } else if (id === 'tesla') {
    ctx.fillStyle = '#2a3a3a';
    ctx.fillRect(-10, -2, 20, 10);
    ctx.strokeStyle = '#4a6a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -2, 20, 10);
    ctx.fillStyle = '#3a4a4a';
    ctx.beginPath(); ctx.arc(-5, 4, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5, 4, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#5a7a7a';
    ctx.beginPath(); ctx.arc(-5, 4, 4, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(5, 4, 4, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#3a4a4a';
    ctx.fillRect(-3, -14, 6, 14);
    ctx.strokeStyle = '#6af';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      let yy = -12 + i * 1.5;
      let w = 4 + (i/8) * 3;
      ctx.beginPath();
      ctx.moveTo(-w, yy); ctx.lineTo(w, yy);
      ctx.stroke();
    }
    let tPulse = Math.sin(s.gameTime * 0.12) * 0.3 + 0.7;
    ctx.fillStyle = hexColor('#8ff', tPulse);
    ctx.beginPath(); ctx.arc(0, -16, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -16, 2, 0, Math.PI*2); ctx.fill();
    if (Math.random() < 0.3) {
      ctx.strokeStyle = hexColor('#8ff', 0.6);
      ctx.lineWidth = 1;
      ctx.beginPath();
      let sa = Math.random() * Math.PI * 2;
      ctx.moveTo(Math.cos(sa)*4, -16 + Math.sin(sa)*4);
      ctx.lineTo(Math.cos(sa)*10 + (Math.random()-0.5)*6, -16 + Math.sin(sa)*10 + (Math.random()-0.5)*6);
      ctx.stroke();
    }
    if (t.chainTimer > 0 && t.chainTargets) {
      ctx.strokeStyle = '#8ff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = t.chainTimer / 8;
      t.chainTargets.forEach(tgt => {
        ctx.beginPath();
        let sx = 0, sy = -16;
        ctx.moveTo(sx, sy);
        let tdx = tgt.x - cx, tdy = tgt.y - cy;
        for (let i = 1; i <= 5; i++) {
          let frac = i / 5;
          let nx = sx + (tdx - sx) * frac + (Math.random()-0.5) * 18;
          let ny = sy + (tdy - sy) * frac + (Math.random()-0.5) * 18;
          if (i === 5) { nx = tdx; ny = tdy; }
          ctx.lineTo(nx, ny);
        }
        ctx.stroke();
        ctx.strokeStyle = hexColor('#8ff', 0.3 * (t.chainTimer / 8));
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8ff';
      });
      ctx.globalAlpha = 1;
    }

  } else if (id === 'cryo') {
    ctx.fillStyle = '#1a3a4a';
    ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#3a6a8a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-10, 0, 5, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#5a8aaa';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(-10, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -3); ctx.lineTo(10, 3); ctx.stroke();
    ctx.strokeStyle = '#3a7a9a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-2, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(2, -3); ctx.stroke();
    ctx.fillStyle = '#2a4a5a';
    ctx.fillRect(-6, -8, 12, 8);
    ctx.strokeStyle = '#4a7a9a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -8, 12, 8);
    let frostPulse = Math.sin(s.gameTime * 0.06) * 0.3 + 0.5;
    ctx.fillStyle = hexColor('#aef', frostPulse * 0.3);
    ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI*2); ctx.fill();
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#3a5a6a';
    ctx.beginPath();
    ctx.moveTo(-5, -4); ctx.lineTo(10, -3);
    ctx.lineTo(14, -5); ctx.lineTo(14, 5);
    ctx.lineTo(10, 3); ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a8a9a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#4a6a7a';
    ctx.beginPath();
    ctx.moveTo(12, -5); ctx.lineTo(18, -7);
    ctx.lineTo(18, 7); ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a9aaa';
    ctx.stroke();
    if (flash) {
      ctx.fillStyle = '#cef';
      ctx.shadowColor = '#6ef';
      ctx.shadowBlur = 12;
      for (let i = 0; i < 3; i++) {
        let a = (i/3)*Math.PI*2 + s.gameTime*0.2;
        let r = 4 + Math.random()*3;
        ctx.beginPath();
        ctx.moveTo(18 + Math.cos(a)*r, Math.sin(a)*r);
        ctx.lineTo(18 + Math.cos(a+0.3)*(r-2), Math.sin(a+0.3)*(r-2));
        ctx.lineTo(18 + Math.cos(a-0.3)*(r-2), Math.sin(a-0.3)*(r-2));
        ctx.closePath();
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(-4, -4, 3, 3);
    ctx.fillStyle = '#6ef';
    ctx.fillRect(-3.5, -3.5 + (1 - frostPulse)*2, 2, frostPulse*2);
    ctx.restore();
    ctx.fillStyle = t.cooldown > 0 ? '#48f' : '#6ef';
    ctx.shadowColor = '#6ef';
    ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(0, -9, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

  } else if (id === 'missile') {
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.moveTo(-14, -4); ctx.lineTo(14, -4);
    ctx.lineTo(15, 8); ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-12, 2, 10, 5);
    ctx.fillRect(2, 2, 10, 5);
    ctx.strokeStyle = '#4a3a2a';
    ctx.strokeRect(-12, 2, 10, 5);
    ctx.strokeRect(2, 2, 10, 5);
    ctx.save();
    ctx.rotate(t.angle);
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.moveTo(-8, -8); ctx.lineTo(10, -7);
    ctx.lineTo(10, 7); ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6a5040';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#3a2518';
    let tubePositions = [[-4,-5],[-4,1],[3,-5],[3,1]];
    tubePositions.forEach(([tx,ty]) => {
      ctx.fillRect(tx, ty, 8, 4);
      ctx.strokeStyle = '#5a4030';
      ctx.strokeRect(tx, ty, 8, 4);
    });
    let missilesLoaded = t.cooldown < t.def.rate * 0.3;
    if (missilesLoaded) {
      ctx.fillStyle = '#f92';
      tubePositions.forEach(([tx,ty]) => {
        ctx.beginPath();
        ctx.moveTo(tx + 8, ty + 0.5);
        ctx.lineTo(tx + 11, ty + 2);
        ctx.lineTo(tx + 8, ty + 3.5);
        ctx.closePath();
        ctx.fill();
      });
    }
    if (flash) {
      ctx.fillStyle = '#fa0';
      ctx.shadowColor = '#f60';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(10, 0, 5, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = hexColor('#ff8', 0.5);
      ctx.beginPath(); ctx.arc(12, 0, 3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(0, -8);
    let radarAngle = s.gameTime * 0.04;
    ctx.rotate(radarAngle);
    ctx.strokeStyle = '#7a6a5a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 6, -0.8, 0.8);
    ctx.stroke();
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 0); ctx.stroke();
    ctx.fillStyle = '#6a5a4a';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = hexColor('#f92', 0.15);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    let rsa = s.gameTime * 0.04;
    ctx.arc(0, -8, 12, rsa - 0.4, rsa);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = t.cooldown > t.def.rate * 0.5 ? '#f00' : '#0f0';
    ctx.beginPath(); ctx.arc(-6, -5, 1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#f92';
    ctx.beginPath(); ctx.arc(6, -5, 1, 0, Math.PI*2); ctx.fill();

  } else if (id === 'pea') {
    // Pea Shooter — cute round green plant tower
    ctx.fillStyle = '#3a2210'; ctx.beginPath(); ctx.ellipse(0,8,10,5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a3318'; ctx.fillRect(-8,4,16,5); ctx.strokeStyle='#7a5530'; ctx.lineWidth=1; ctx.strokeRect(-8,4,16,5);
    ctx.fillStyle = '#2d7a1a'; ctx.fillRect(-3,-8,6,16);
    ctx.fillStyle = '#1a5a10'; ctx.fillRect(-4,-4,8,4);
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle = '#3d9a2a'; ctx.beginPath(); ctx.arc(0,-8,7,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#5abb3a'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#2a7a18'; ctx.beginPath(); ctx.arc(0,-8,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = flash ? '#aaffaa' : '#7eff5a';
    ctx.shadowColor='#4f0'; ctx.shadowBlur = flash?10:4;
    ctx.beginPath(); ctx.arc(0,-15,4,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.restore();
    ctx.fillStyle='#5a0'; for(let i=0;i<3;i++){let a=(i/3)*Math.PI*2; ctx.beginPath(); ctx.arc(Math.cos(a)*9,Math.sin(a)*4+4,2,0,Math.PI*2); ctx.fill();}

  } else if (id === 'spark') {
    // Spark Tower — amber/yellow electric coil
    ctx.fillStyle = '#3a3010'; ctx.fillRect(-10,2,20,10); ctx.strokeStyle='#6a5520'; ctx.lineWidth=1; ctx.strokeRect(-10,2,20,10);
    ctx.strokeStyle='#8a7030'; ctx.lineWidth=2;
    for(let i=0;i<4;i++){ctx.beginPath(); ctx.arc(0,4+i*1.5,8-i*1.5,0,Math.PI*2); ctx.stroke();}
    ctx.fillStyle='#2a2000'; ctx.fillRect(-3,-12,6,14);
    ctx.strokeStyle='#cc9900'; ctx.lineWidth=1.5;
    for(let i=0;i<5;i++){ctx.beginPath(); ctx.moveTo(-5+i*2,-10); ctx.lineTo(-5+i*2+1,-8); ctx.stroke();}
    let spk=Math.sin(s.gameTime*0.15)*0.3+0.7;
    ctx.fillStyle=hexColor('#ffcc00',spk); ctx.shadowColor='#ffcc00'; ctx.shadowBlur=flash?18:6+spk*4;
    ctx.beginPath(); ctx.arc(0,-13,5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    if(Math.random()<0.5||flash){
      ctx.strokeStyle=hexColor('#ffcc00',0.8); ctx.lineWidth=1.5;
      let sa=Math.random()*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(Math.cos(sa)*4,-13+Math.sin(sa)*4);
      ctx.lineTo(Math.cos(sa)*12+Math.random()*8-4,-13+Math.sin(sa)*12+Math.random()*6-3); ctx.stroke();
    }

  } else if (id === 'photon') {
    // Photon Blaster — sleek orange energy cannon
    ctx.fillStyle='#2a1500'; ctx.fillRect(-12,-2,24,10); ctx.strokeStyle='#4a3010'; ctx.lineWidth=1; ctx.strokeRect(-12,-2,24,10);
    ctx.fillStyle='#3a2010'; ctx.fillRect(-8,-8,16,6); ctx.strokeStyle='#5a3020'; ctx.strokeRect(-8,-8,16,6);
    let ppulse=Math.sin(s.gameTime*0.1)*0.3+0.5;
    ctx.fillStyle=hexColor('#ff9900',ppulse*0.4); ctx.beginPath(); ctx.arc(0,-5,6,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle='#3a2800';
    ctx.beginPath(); ctx.moveTo(-7,-6); ctx.lineTo(10,-5); ctx.lineTo(16,-2); ctx.lineTo(16,2); ctx.lineTo(10,5); ctx.lineTo(-7,6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#6a4800'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#4a3a00'; ctx.fillRect(10,-4,10,3); ctx.fillRect(10,1,10,3);
    ctx.fillStyle = flash?'#fff':'#ff9900';
    ctx.shadowColor='#ff9900'; ctx.shadowBlur=flash?18:8;
    ctx.beginPath(); ctx.arc(20,0,3,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    if(flash){
      ctx.strokeStyle='#ffc200'; ctx.lineWidth=1.5;
      for(let i=0;i<5;i++){let a=(i/5)*Math.PI*2; ctx.beginPath(); ctx.moveTo(20+Math.cos(a)*3,Math.sin(a)*3); ctx.lineTo(20+Math.cos(a)*8,Math.sin(a)*8); ctx.stroke();}
    }
    ctx.restore();

  } else if (id === 'gravity') {
    // Gravity Well — purple vortex AOE tower
    let gSpin = s.gameTime * 0.05;
    ctx.fillStyle='#1a0a2a'; ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#4422aa'; ctx.lineWidth=1.5; ctx.stroke();
    for(let ring=0;ring<3;ring++){
      let r=4+ring*4, alpha=0.8-ring*0.2;
      ctx.strokeStyle=hexColor('#8844ff',alpha);
      ctx.lineWidth=1.5-ring*0.3;
      ctx.beginPath(); ctx.arc(0,0,r,gSpin+ring*0.8,(gSpin+ring*0.8)+Math.PI*1.5); ctx.stroke();
    }
    let vpulse=Math.sin(s.gameTime*0.08)*0.3+0.7;
    ctx.fillStyle=hexColor('#aa66ff',vpulse); ctx.shadowColor='#8844ff'; ctx.shadowBlur=12+vpulse*8;
    ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='#cc99ff'; ctx.beginPath(); ctx.arc(0,0,2,0,Math.PI*2); ctx.fill();
    for(let orb=0;orb<4;orb++){
      let a=gSpin*3+orb*(Math.PI/2), r=10;
      ctx.fillStyle=hexColor('#aa66ff',0.7);
      ctx.beginPath(); ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2,0,Math.PI*2); ctx.fill();
    }
    if(flash){ctx.strokeStyle='#cc88ff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,16+Math.random()*4,0,Math.PI*2); ctx.stroke();}

  } else if (id === 'vortex') {
    // Vortex Cannon — magenta spiral pierce AOE
    ctx.fillStyle='#2a001a'; ctx.fillRect(-14,-4,28,12); ctx.strokeStyle='#660044'; ctx.lineWidth=1; ctx.strokeRect(-14,-4,28,12);
    ctx.fillStyle='#1a0010'; ctx.fillRect(-10,-10,20,6); ctx.strokeStyle='#440033'; ctx.strokeRect(-10,-10,20,6);
    let vspin=s.gameTime*0.08;
    for(let i=0;i<3;i++){ctx.strokeStyle=hexColor('#ff44ff',0.4+i*0.2); ctx.lineWidth=1+i*0.5; ctx.beginPath(); ctx.arc(0,-7,5+i*2,vspin+i,vspin+i+Math.PI*1.6); ctx.stroke();}
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle='#3a0025';
    ctx.beginPath(); ctx.moveTo(-10,-6); ctx.lineTo(6,-5); ctx.lineTo(20,-2); ctx.lineTo(20,2); ctx.lineTo(6,5); ctx.lineTo(-10,6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#880055'; ctx.lineWidth=1; ctx.stroke();
    for(let i=0;i<4;i++){let x=4+i*4; ctx.strokeStyle=hexColor('#ff44ff',0.5+i*0.1); ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(x,0,3-i*0.4,-Math.PI*0.8,Math.PI*0.8); ctx.stroke();}
    ctx.fillStyle=flash?'#fff':'#ff44ff';
    ctx.shadowColor='#ff44ff'; ctx.shadowBlur=flash?20:10;
    ctx.beginPath(); ctx.arc(20,0,3.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.restore();

  } else if (id === 'disruptor') {
    // Disruptor (Laser+EMP fusion) — yellow-green electric laser
    ctx.fillStyle='#2a2a00'; ctx.fillRect(-12,-4,24,12); ctx.strokeStyle='#6a6a10'; ctx.lineWidth=2; ctx.strokeRect(-12,-4,24,12);
    ctx.fillStyle='#1a1a00'; ctx.fillRect(-4,-14,8,10);
    let dp=Math.sin(s.gameTime*0.1)*0.4+0.6;
    for(let i=0;i<3;i++){ctx.strokeStyle=hexColor('#ddff00',dp*(0.5+i*0.15)); ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(0,-10,6+i*2,2+i,0,0,Math.PI*2); ctx.stroke();}
    ctx.fillStyle=hexColor('#ffff00',dp); ctx.shadowColor='#ffee00'; ctx.shadowBlur=8+dp*6;
    ctx.beginPath(); ctx.arc(0,-12,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle='#3a3a10';
    ctx.beginPath(); ctx.moveTo(-8,-5); ctx.lineTo(8,-4); ctx.lineTo(18,-1.5); ctx.lineTo(18,1.5); ctx.lineTo(8,4); ctx.lineTo(-8,5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#aaaa30'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle=flash?'#fff':'#eeff00';
    ctx.shadowColor='#ddff00'; ctx.shadowBlur=flash?20:10;
    ctx.beginPath(); ctx.arc(18,0,3,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    if(flash){ctx.strokeStyle='#ffff44'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(18,0,8+Math.random()*4,0,Math.PI*2); ctx.stroke();}
    ctx.restore();

  } else if (id === 'plasmaRocket') {
    // Plasma Rocket (Plasma+Missile) — orange-purple multi-launcher
    ctx.fillStyle='#2a1020'; ctx.fillRect(-14,-4,28,12); ctx.strokeStyle='#5a2040'; ctx.lineWidth=1.5; ctx.strokeRect(-14,-4,28,12);
    ctx.fillStyle='#1a0818'; ctx.fillRect(-10,2,10,7); ctx.fillRect(0,2,10,7);
    [[-8,2],[2,2],[-8,6],[2,6]].forEach(([tx,ty])=>{ctx.strokeStyle='#6a3050'; ctx.lineWidth=1; ctx.strokeRect(tx,ty,8,4);});
    let rpulse=Math.sin(s.gameTime*0.12)*0.3+0.7;
    ctx.fillStyle=hexColor('#ff6600',rpulse*0.4); ctx.beginPath(); ctx.arc(-4,-3,8,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle='#3a1828';
    ctx.beginPath(); ctx.moveTo(-9,-7); ctx.lineTo(8,-6); ctx.lineTo(12,-3); ctx.lineTo(12,3); ctx.lineTo(8,6); ctx.lineTo(-9,7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#7a3850'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='#4a2030'; [[-4,-5],[-4,1],[2,-5],[2,1]].forEach(([tx,ty])=>{ctx.fillRect(tx,ty,8,4);});
    ctx.fillStyle=flash?'#fff':'#ff6600';
    ctx.shadowColor='#ff6600'; ctx.shadowBlur=flash?18:8;
    ctx.beginPath(); ctx.arc(12,0,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.restore();
    let ra=s.gameTime*0.06; ctx.strokeStyle='#cc6688'; ctx.lineWidth=1;
    ctx.save(); ctx.translate(0,-8); ctx.rotate(ra);
    ctx.beginPath(); ctx.arc(0,0,6,-0.8,0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(5,0); ctx.stroke();
    ctx.restore();

  } else if (id === 'absoluteZero') {
    // Absolute Zero (Tesla+Cryo) — ice blue crystal spires
    ctx.fillStyle='#0a1a2a'; ctx.fillRect(-12,-2,24,12); ctx.strokeStyle='#1a4a6a'; ctx.lineWidth=1.5; ctx.strokeRect(-12,-2,24,12);
    [[0,-18],[-8,-14],[8,-14]].forEach(([sx,sy],i)=>{
      ctx.fillStyle='#1a3a5a';
      ctx.beginPath(); ctx.moveTo(sx-3,sy+12); ctx.lineTo(sx,sy); ctx.lineTo(sx+3,sy+12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#4a8aaa'; ctx.lineWidth=1; ctx.stroke();
      let cp=Math.sin(s.gameTime*0.08+i*1.2)*0.3+0.7;
      ctx.fillStyle=hexColor('#00eeff',cp*0.6); ctx.beginPath(); ctx.arc(sx,sy,2.5,0,Math.PI*2); ctx.fill();
    });
    let azp=Math.sin(s.gameTime*0.1)*0.3+0.7;
    ctx.fillStyle=hexColor('#00eeff',azp); ctx.shadowColor='#00eeff'; ctx.shadowBlur=10+azp*8;
    ctx.beginPath(); ctx.arc(0,-18,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    if(Math.random()<0.3||flash){
      ctx.strokeStyle=hexColor('#88ffff',0.7); ctx.lineWidth=1.5;
      let azA=Math.random()*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(Math.cos(azA)*4,-18+Math.sin(azA)*4);
      ctx.lineTo(Math.cos(azA)*14+Math.random()*10-5,-18+Math.sin(azA)*14+Math.random()*8-4); ctx.stroke();
    }
    ctx.fillStyle='#1a2a3a';
    for(let i=0;i<5;i++){let y=-2+i*2; ctx.beginPath(); ctx.arc(-10+i*4,y,1.5,0,Math.PI*2); ctx.fill();}

  } else if (id === 'annihilator') {
    // Annihilator (Rail+Plasma) — massive twin barrel chrome destroyer
    ctx.fillStyle='#2a2a2a'; ctx.fillRect(-16,-4,32,10); ctx.strokeStyle='#6a6a6a'; ctx.lineWidth=2; ctx.strokeRect(-16,-4,32,10);
    ctx.fillStyle='#3a3a3a'; ctx.fillRect(-14,-10,8,6); ctx.fillRect(6,-10,8,6);
    ctx.strokeStyle='#888'; ctx.lineWidth=1; ctx.strokeRect(-14,-10,8,6); ctx.strokeRect(6,-10,8,6);
    let achg=t.cooldown/t.def.rate;
    ctx.fillStyle=hexColor('#ffffff',achg*0.3); ctx.beginPath(); ctx.arc(0,-7,6,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle='#353535';
    ctx.beginPath(); ctx.moveTo(-12,-7); ctx.lineTo(6,-5); ctx.lineTo(24,-4); ctx.lineTo(24,-1); ctx.lineTo(24,1); ctx.lineTo(24,4); ctx.lineTo(6,5); ctx.lineTo(-12,7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#888'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#555'; ctx.fillRect(6,-5.5,18,4); ctx.fillRect(6,1.5,18,4);
    ctx.strokeStyle='#aaa'; ctx.lineWidth=0.8;
    for(let i=0;i<6;i++){let x=8+i*3; ctx.beginPath(); ctx.moveTo(x,-6); ctx.lineTo(x,6); ctx.stroke();}
    ctx.fillStyle=flash?'#fff':'#ffffff';
    ctx.shadowColor='#ffffff'; ctx.shadowBlur=flash?25:12;
    ctx.beginPath(); ctx.arc(24,-2.5,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(24,2.5,3,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    if(flash){ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(24,0); ctx.lineTo(38,0); ctx.stroke();}
    ctx.restore();
    ctx.fillStyle='#aaa'; ctx.beginPath(); ctx.arc(0,-7,2,0,Math.PI*2); ctx.fill();

  } else if (id === 'prism') {
    // Prism Cannon (Photon+Vortex) — rainbow crystal prism
    let ptime=s.gameTime*0.06;
    ctx.fillStyle='#1a001a'; ctx.fillRect(-12,-2,24,12); ctx.strokeStyle='#440044'; ctx.lineWidth=1.5; ctx.strokeRect(-12,-2,24,12);
    ctx.fillStyle='#0a000a'; ctx.fillRect(-6,-14,12,12); ctx.strokeStyle='#330033'; ctx.strokeRect(-6,-14,12,12);
    [[0,-14],[-5,-8],[5,-8],[-3,-3],[3,-3]].forEach(([px,py],i)=>{
      let hue=`hsl(${(i*72+ptime*30)%360},100%,70%)`;
      ctx.fillStyle=hue; ctx.globalAlpha=0.7;
      ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    ctx.strokeStyle=`hsl(${(ptime*40)%360},100%,60%)`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(0,-8,8,ptime,ptime+Math.PI*1.8); ctx.stroke();
    ctx.save(); ctx.rotate(t.angle);
    ctx.fillStyle='#2a002a';
    ctx.beginPath(); ctx.moveTo(-8,-5); ctx.lineTo(6,-4); ctx.lineTo(20,-2); ctx.lineTo(20,2); ctx.lineTo(6,4); ctx.lineTo(-8,5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#880088'; ctx.lineWidth=1.5; ctx.stroke();
    let prainbow=`hsl(${(ptime*50)%360},100%,65%)`;
    ctx.fillStyle=flash?'#fff':prainbow;
    ctx.shadowColor=prainbow; ctx.shadowBlur=flash?22:12;
    ctx.beginPath(); ctx.arc(20,0,4,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    if(flash){
      for(let i=0;i<6;i++){let a=(i/6)*Math.PI*2; ctx.strokeStyle=`hsl(${i*60},100%,70%)`; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(20+Math.cos(a)*4,Math.sin(a)*4); ctx.lineTo(20+Math.cos(a)*12,Math.sin(a)*12); ctx.stroke();}
    }
    ctx.restore();
  }

  ctx.restore();
}

// ============ DRAW ROBOTS ============
function drawRobot(e: Enemy): void {
  let cx = e.x, cy = e.y;
  let s = e.type.size;
  let col = e.type.color;
  let name = e.type.name;
  let walk = e.walkCycle;
  let facing = e.facing;
  let slowed = e.slowTimer > 0;

  ctx.save();
  ctx.translate(cx, cy);

  if (name === 'Scout') {
    let legSwing = Math.sin(walk) * 0.4;
    let bodyBob = Math.abs(Math.sin(walk)) * 1.5;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-3, 2 - bodyBob);
    ctx.lineTo(-5, 7 + Math.sin(walk)*2);
    ctx.lineTo(-3, 10);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(3, 2 - bodyBob);
    ctx.lineTo(5, 7 + Math.sin(walk + Math.PI)*2);
    ctx.lineTo(3, 10);
    ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.fillRect(-5, 9 + Math.sin(walk)*2, 4, 2);
    ctx.fillRect(2, 9 + Math.sin(walk+Math.PI)*2, 4, 2);
    ctx.fillStyle = '#922';
    ctx.beginPath();
    ctx.moveTo(-5, -3 - bodyBob);
    ctx.lineTo(5, -3 - bodyBob);
    ctx.lineTo(6, 3 - bodyBob);
    ctx.lineTo(-6, 3 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c44';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#a33';
    ctx.fillRect(-4, -7 - bodyBob, 8, 4);
    ctx.fillStyle = slowed ? '#ff0' : '#f00';
    ctx.fillRect(-3, -6 - bodyBob, 6, 2);
    ctx.shadowColor = slowed ? '#ff0' : '#f00';
    ctx.shadowBlur = 4;
    ctx.fillRect(-3, -6 - bodyBob, 6, 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -7 - bodyBob); ctx.lineTo(0, -11 - bodyBob); ctx.stroke();
    ctx.fillStyle = '#f00';
    ctx.beginPath(); ctx.arc(0, -11 - bodyBob, 1, 0, Math.PI*2); ctx.fill();

  } else if (name === 'Soldier') {
    let legSwing = Math.sin(walk) * 0.5;
    let bodyBob = Math.abs(Math.sin(walk)) * 1;
    ctx.fillStyle = '#885500';
    ctx.save();
    ctx.translate(-4, 3 - bodyBob);
    ctx.rotate(legSwing);
    ctx.fillRect(-2, 0, 4, 8);
    ctx.fillStyle = '#664400';
    ctx.fillRect(-2.5, 7, 5, 3);
    ctx.restore();
    ctx.save();
    ctx.translate(4, 3 - bodyBob);
    ctx.rotate(-legSwing);
    ctx.fillStyle = '#885500';
    ctx.fillRect(-2, 0, 4, 8);
    ctx.fillStyle = '#664400';
    ctx.fillRect(-2.5, 7, 5, 3);
    ctx.restore();
    ctx.fillStyle = '#996600';
    ctx.beginPath();
    ctx.moveTo(-7, -4 - bodyBob); ctx.lineTo(7, -4 - bodyBob);
    ctx.lineTo(6, 4 - bodyBob); ctx.lineTo(-6, 4 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#bb8800';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#774400';
    ctx.fillRect(-4, -2 - bodyBob, 8, 3);
    ctx.strokeStyle = '#aa7700';
    ctx.strokeRect(-4, -2 - bodyBob, 8, 3);
    ctx.fillStyle = '#885500';
    ctx.fillRect(-10, -3 - bodyBob, 4, 6);
    ctx.fillRect(6, -3 - bodyBob, 4, 6);
    ctx.fillStyle = '#555';
    ctx.fillRect(9, -2 - bodyBob, 5, 2);
    ctx.fillStyle = '#885500';
    ctx.fillRect(-5, -9 - bodyBob, 10, 5);
    ctx.fillStyle = '#663300';
    ctx.fillRect(-4, -8 - bodyBob, 8, 3);
    ctx.fillStyle = slowed ? '#ff0' : '#fa0';
    ctx.shadowColor = slowed ? '#ff0' : '#fa0';
    ctx.shadowBlur = 4;
    ctx.fillRect(-3, -7 - bodyBob, 2, 1.5);
    ctx.fillRect(1, -7 - bodyBob, 2, 1.5);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#aa7700';
    ctx.beginPath(); ctx.arc(-8, -4 - bodyBob, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -4 - bodyBob, 3, 0, Math.PI*2); ctx.fill();

  } else if (name === 'Tank') {
    let rumble = Math.sin(s.gameTime * 0.3) * 0.5;
    ctx.fillStyle = '#444';
    ctx.fillRect(-13, 4, 26, 6);
    ctx.fillStyle = '#333';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(-12 + i*4, 4.5, 2, 5);
    }
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, 4, 26, 6);
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(-10, 7, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 7, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 7, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#733';
    ctx.beginPath();
    ctx.moveTo(-12, 4); ctx.lineTo(-10, -3 + rumble);
    ctx.lineTo(10, -3 + rumble); ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#944';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#622';
    ctx.fillRect(-8, -1 + rumble, 16, 3);
    ctx.save();
    ctx.translate(0, -4 + rumble);
    ctx.rotate(facing);
    ctx.fillStyle = '#844';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#a66';
    ctx.stroke();
    ctx.fillStyle = '#655';
    ctx.fillRect(4, -2, 10, 4);
    ctx.fillStyle = '#533';
    ctx.fillRect(12, -2.5, 3, 5);
    ctx.restore();
    ctx.fillStyle = '#955';
    ctx.fillRect(-11, 0 + rumble, 3, 3);
    ctx.fillRect(8, 0 + rumble, 3, 3);
    ctx.fillStyle = slowed ? '#ff0' : '#f00';
    ctx.shadowColor = slowed ? '#ff0' : '#f00';
    ctx.shadowBlur = 3;
    ctx.beginPath(); ctx.arc(0, -5 + rumble, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

  } else if (name === 'Drone') {
    let hover = Math.sin(s.gameTime * 0.15) * 3;
    let propSpin = s.gameTime * 0.8;
    ctx.translate(0, hover);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 8 - hover, 6, 2, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#336';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(8, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-2, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(2, 2); ctx.stroke();
    ctx.fillStyle = '#336';
    ctx.beginPath();
    ctx.moveTo(-3, -4); ctx.lineTo(3, -4);
    ctx.lineTo(4, 0); ctx.lineTo(3, 2);
    ctx.lineTo(-3, 2); ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#55a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.strokeStyle = hexColor('#4af', 0.6);
    ctx.lineWidth = 1.5;
    [[-8,-2],[8,-2],[-2,-6],[2,2]].forEach(([px,py], i) => {
      let a = propSpin + i * Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(a)*4, py + Math.sin(a)*1.5);
      ctx.lineTo(px - Math.cos(a)*4, py - Math.sin(a)*1.5);
      ctx.stroke();
      ctx.strokeStyle = hexColor('#4af', 0.15);
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = hexColor('#4af', 0.6);
    });
    ctx.fillStyle = slowed ? '#ff0' : '#4af';
    ctx.shadowColor = slowed ? '#ff0' : '#4af';
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(0, -1, 2, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#112';
    ctx.beginPath(); ctx.arc(0, -1, 1, 0, Math.PI*2); ctx.fill();

  } else if (name === 'Mech') {
    let legSwing = Math.sin(walk) * 0.3;
    let bodyBob = Math.abs(Math.sin(walk)) * 2;
    ctx.lineWidth = 3;
    ctx.save();
    ctx.translate(-6, 4 - bodyBob);
    ctx.rotate(legSwing);
    ctx.fillStyle = '#636';
    ctx.fillRect(-3, 0, 6, 8);
    ctx.fillStyle = '#858';
    ctx.beginPath(); ctx.arc(0, 8, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#525';
    ctx.fillRect(-3, 8, 6, 8);
    ctx.fillStyle = '#747';
    ctx.beginPath();
    ctx.moveTo(-5, 16); ctx.lineTo(5, 16); ctx.lineTo(6, 18); ctx.lineTo(-6, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(6, 4 - bodyBob);
    ctx.rotate(-legSwing);
    ctx.fillStyle = '#636';
    ctx.fillRect(-3, 0, 6, 8);
    ctx.fillStyle = '#858';
    ctx.beginPath(); ctx.arc(0, 8, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#525';
    ctx.fillRect(-3, 8, 6, 8);
    ctx.fillStyle = '#747';
    ctx.beginPath();
    ctx.moveTo(-5, 16); ctx.lineTo(5, 16); ctx.lineTo(6, 18); ctx.lineTo(-6, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#747';
    ctx.beginPath();
    ctx.moveTo(-10, -6 - bodyBob); ctx.lineTo(10, -6 - bodyBob);
    ctx.lineTo(9, 5 - bodyBob); ctx.lineTo(-9, 5 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#969';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = hexColor('#f4f', 0.5 + Math.sin(s.gameTime*0.08)*0.3);
    ctx.beginPath(); ctx.arc(0, -1 - bodyBob, 4, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#c3c';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, -1 - bodyBob, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#636';
    ctx.fillRect(-14, -9 - bodyBob, 5, 6);
    ctx.fillRect(9, -9 - bodyBob, 5, 6);
    ctx.fillStyle = '#444';
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        ctx.fillRect(-13.5 + j*2.5, -8.5 + i*2.5 - bodyBob, 2, 2);
    ctx.fillStyle = '#636';
    ctx.fillRect(9, -9 - bodyBob, 5, 6);
    ctx.fillStyle = '#555';
    ctx.fillRect(13, -8 - bodyBob, 6, 1.5);
    ctx.fillRect(13, -6 - bodyBob, 6, 1.5);
    ctx.fillStyle = '#858';
    ctx.beginPath();
    ctx.moveTo(-5, -10 - bodyBob); ctx.lineTo(5, -10 - bodyBob);
    ctx.lineTo(4, -6 - bodyBob); ctx.lineTo(-4, -6 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = slowed ? '#ff0' : '#f4f';
    ctx.shadowColor = slowed ? '#ff0' : '#f4f';
    ctx.shadowBlur = 6;
    ctx.fillRect(-4, -9 - bodyBob, 8, 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, -10 - bodyBob); ctx.lineTo(-3, -14 - bodyBob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -10 - bodyBob); ctx.lineTo(3, -14 - bodyBob); ctx.stroke();

  } else if (name === 'Swarm') {
    let scurry = walk * 2;
    ctx.strokeStyle = '#484';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      let angle = (i / 6) * Math.PI * 2 + Math.sin(scurry + i * 1.2) * 0.3;
      let legLen = 5 + Math.sin(scurry + i * 1.5) * 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 2, Math.sin(angle) * 2);
      let midX = Math.cos(angle) * 4;
      let midY = Math.sin(angle) * 4 - 2;
      ctx.lineTo(midX, midY);
      ctx.lineTo(Math.cos(angle) * legLen, Math.sin(angle) * legLen + 1);
      ctx.stroke();
    }
    ctx.fillStyle = '#4a4';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6c6';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = '#383';
    ctx.beginPath();
    ctx.ellipse(-2, 1, 2.5, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = slowed ? '#ff0' : '#f00';
    ctx.shadowColor = slowed ? '#ff0' : '#f00';
    ctx.shadowBlur = 3;
    ctx.beginPath(); ctx.arc(2, -1.5, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, 0, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(2, 1, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

  } else if (name === 'Titan') {
    let legSwing = Math.sin(walk) * 0.25;
    let bodyBob = Math.abs(Math.sin(walk)) * 2;
    let breathe = Math.sin(s.gameTime * 0.05) * 0.5;
    ctx.save();
    ctx.translate(-10, 6 - bodyBob);
    ctx.rotate(legSwing);
    ctx.fillStyle = '#888';
    ctx.fillRect(-3, 0, 6, 10);
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.arc(0, 10, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-3, 10, 6, 8);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-5, 17, 8, 3);
    ctx.restore();
    ctx.save();
    ctx.translate(10, 6 - bodyBob);
    ctx.rotate(-legSwing);
    ctx.fillStyle = '#888';
    ctx.fillRect(-3, 0, 6, 10);
    ctx.fillStyle = '#999';
    ctx.beginPath(); ctx.arc(0, 10, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-3, 10, 6, 8);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(-3, 17, 8, 3);
    ctx.restore();
    ctx.save();
    ctx.translate(-8, 2 - bodyBob);
    ctx.rotate(-legSwing);
    ctx.fillStyle = '#999';
    ctx.fillRect(-3, 0, 5, 10);
    ctx.fillStyle = '#aaa';
    ctx.beginPath(); ctx.arc(0, 10, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-3, 10, 5, 7);
    ctx.fillStyle = '#bbb';
    ctx.fillRect(-4, 16, 7, 3);
    ctx.restore();
    ctx.save();
    ctx.translate(8, 2 - bodyBob);
    ctx.rotate(legSwing);
    ctx.fillStyle = '#999';
    ctx.fillRect(-2, 0, 5, 10);
    ctx.fillStyle = '#aaa';
    ctx.beginPath(); ctx.arc(0, 10, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-2, 10, 5, 7);
    ctx.fillStyle = '#bbb';
    ctx.fillRect(-3, 16, 7, 3);
    ctx.restore();
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(-14, -4 - bodyBob); ctx.lineTo(14, -4 - bodyBob);
    ctx.lineTo(13, 8 - bodyBob); ctx.lineTo(-13, 8 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#999';
    ctx.fillRect(-12, -2 - bodyBob, 24, 3);
    ctx.fillRect(-12, 3 - bodyBob, 24, 3);
    ctx.fillStyle = '#bbb';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.arc(-10 + i*4, -2 - bodyBob, 1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-10 + i*4, 6 - bodyBob, 1, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = hexColor('#fff', 0.4 + breathe * 0.3);
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, 1 - bodyBob, 5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 1 - bodyBob, 2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#bbb';
    ctx.beginPath();
    ctx.moveTo(-8, -10 - bodyBob); ctx.lineTo(8, -10 - bodyBob);
    ctx.lineTo(10, -4 - bodyBob); ctx.lineTo(-10, -4 - bodyBob);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.stroke();
    ctx.fillStyle = slowed ? '#ff0' : '#f44';
    ctx.shadowColor = slowed ? '#ff0' : '#f44';
    ctx.shadowBlur = 8;
    ctx.fillRect(-7, -9 - bodyBob, 14, 3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#200';
    ctx.fillRect(-3, -9 - bodyBob, 1, 3);
    ctx.fillRect(2, -9 - bodyBob, 1, 3);
    ctx.fillStyle = '#999';
    ctx.fillRect(-16, -8 - bodyBob, 5, 5);
    ctx.fillRect(11, -8 - bodyBob, 5, 5);
    ctx.fillStyle = '#777';
    ctx.fillRect(-17, -7 - bodyBob, 2, 3);
    ctx.fillRect(16, -7 - bodyBob, 2, 3);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -10 - bodyBob); ctx.lineTo(-8, -16 - bodyBob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -10 - bodyBob); ctx.lineTo(8, -16 - bodyBob); ctx.stroke();
    ctx.fillStyle = '#f00';
    ctx.beginPath(); ctx.arc(-8, -16 - bodyBob, 1.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -16 - bodyBob, 1.5, 0, Math.PI*2); ctx.fill();

  } else if (name === 'Juggernaut') {
    let stomp = Math.abs(Math.sin(walk * 0.5)) * 3;
    let breathe = Math.sin(s.gameTime * 0.04) * 1;
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0,20,22,5,0,0,Math.PI*2); ctx.fill();
    // Four massive legs
    for(let si=-1;si<=1;si+=2){
      for(let li=0;li<2;li++){
        let lx=si*(li===0?10:20), lph=walk*0.5+li*Math.PI;
        ctx.save(); ctx.translate(lx,6+stomp*(li%2===0?1:0));
        ctx.fillStyle='#7a0a14'; ctx.fillRect(-4,0,8,16);
        ctx.fillStyle='#aa1a22'; ctx.beginPath(); ctx.arc(0,16,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#cc2030'; ctx.fillRect(-6,20,12,5);
        ctx.strokeStyle='#ff3040'; ctx.lineWidth=1; ctx.strokeRect(-6,20,12,5);
        ctx.restore();
      }
    }
    // Waist armor plate
    ctx.fillStyle='#660a10'; ctx.fillRect(-22,4,44,6); ctx.strokeStyle='#aa2020'; ctx.lineWidth=1.5; ctx.strokeRect(-22,4,44,6);
    // Main body
    let bodyGrad=ctx.createLinearGradient(-22,-12+breathe,22,8);
    bodyGrad.addColorStop(0,'#cc1020'); bodyGrad.addColorStop(0.5,'#991018'); bodyGrad.addColorStop(1,'#770a12');
    ctx.fillStyle=bodyGrad;
    ctx.beginPath(); ctx.moveTo(-22,-10+breathe); ctx.lineTo(22,-10+breathe); ctx.lineTo(24,4); ctx.lineTo(-24,4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#ff3040'; ctx.lineWidth=2; ctx.stroke();
    // Armor panel lines
    ctx.strokeStyle='#aa1020'; ctx.lineWidth=1;
    for(let i=-3;i<=3;i++){ctx.beginPath(); ctx.moveTo(i*7,-10+breathe); ctx.lineTo(i*8+1,4); ctx.stroke();}
    // Armor bolts
    ctx.fillStyle='#ff4450';
    [[-20,-4],[-20,0],[20,-4],[20,0],[-8,2],[8,2],[0,2]].forEach(([bx,by])=>{ctx.beginPath(); ctx.arc(bx,by+breathe,1.8,0,Math.PI*2); ctx.fill();});
    // Shoulder cannons
    for(let si=-1;si<=1;si+=2){
      ctx.fillStyle='#550810'; ctx.fillRect(si>0?16:-26,-24+breathe,10,12); ctx.strokeStyle='#aa1520'; ctx.lineWidth=1.5; ctx.strokeRect(si>0?16:-26,-24+breathe,10,12);
      ctx.fillStyle='#3a0608'; ctx.fillRect(si>0?24:-22,-26+breathe,6,16);
      let sp=Math.sin(s.gameTime*0.12)*0.3+0.7;
      ctx.fillStyle=hexColor('#ff2200',sp); ctx.shadowColor='#ff2200'; ctx.shadowBlur=8+sp*4;
      ctx.beginPath(); ctx.arc(si*24,-18+breathe,3.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    }
    // Head
    ctx.fillStyle='#550810'; ctx.fillRect(-12,-26+breathe,24,14); ctx.strokeStyle='#991520'; ctx.lineWidth=1.5; ctx.strokeRect(-12,-26+breathe,24,14);
    // Visor
    ctx.fillStyle=slowed?'#ff0':'#ff1800';
    ctx.shadowColor=slowed?'#ff0':'#ff1800'; ctx.shadowBlur=14;
    ctx.fillRect(-9,-22+breathe,18,6); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(-8,-22+breathe,4,2);
    // Head detail
    ctx.fillStyle='#660a10'; ctx.fillRect(-10,-28+breathe,20,2);
    ctx.fillStyle='#ff3030'; ctx.beginPath(); ctx.arc(-8,-28+breathe,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8,-28+breathe,1.5,0,Math.PI*2); ctx.fill();

  } else if (name === 'Specter') {
    let phase = s.gameTime * 0.08;
    let hover = Math.sin(phase * 1.3) * 3;
    let blink = Math.sin(phase * 4) * 0.5 + 0.5;
    // Speed trails
    ctx.globalAlpha = 0.3;
    for(let tr=1;tr<=4;tr++){
      ctx.fillStyle=hexColor('#00ffcc',0.6-tr*0.12);
      ctx.beginPath(); ctx.moveTo(0,-7+hover+tr*3); ctx.lineTo(6-tr,hover+tr*4); ctx.lineTo(-6+tr,hover+tr*4); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=1;
    // Shadow
    ctx.fillStyle='rgba(0,200,180,0.12)'; ctx.beginPath(); ctx.ellipse(0,10-hover,6,2,0,0,Math.PI*2); ctx.fill();
    // Main body — streamlined teardrop
    ctx.fillStyle='#003330';
    ctx.beginPath(); ctx.moveTo(0,-10+hover); ctx.bezierCurveTo(8,-4+hover,8,4+hover,0,8+hover); ctx.bezierCurveTo(-8,4+hover,-8,-4+hover,0,-10+hover); ctx.fill();
    // Glowing hull
    ctx.strokeStyle='#00ffcc'; ctx.lineWidth=1.5;
    ctx.shadowColor='#00ffcc'; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.moveTo(0,-10+hover); ctx.bezierCurveTo(8,-4+hover,8,4+hover,0,8+hover); ctx.bezierCurveTo(-8,4+hover,-8,-4+hover,0,-10+hover); ctx.stroke();
    ctx.shadowBlur=0;
    // Highlight stripe
    ctx.strokeStyle='rgba(0,255,200,0.4)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-2,-9+hover); ctx.bezierCurveTo(-4,-5+hover,-4,2+hover,-2,7+hover); ctx.stroke();
    // Eye
    ctx.fillStyle=slowed?'#ff0':'#ffffff';
    ctx.shadowColor=slowed?'#ff0':'#00ffcc'; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.arc(0,-1+hover,2.5+blink*0.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='#002220'; ctx.beginPath(); ctx.arc(0,-1+hover,1.2,0,Math.PI*2); ctx.fill();
    // Wing fins
    ctx.fillStyle='rgba(0,200,160,0.5)';
    ctx.beginPath(); ctx.moveTo(-2,2+hover); ctx.lineTo(-10,6+hover); ctx.lineTo(-4,8+hover); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(2,2+hover); ctx.lineTo(10,6+hover); ctx.lineTo(4,8+hover); ctx.closePath(); ctx.fill();
    // Warp s.particles
    if(Math.random()<0.4){ctx.fillStyle='rgba(0,255,180,0.6)'; ctx.beginPath(); ctx.arc((Math.random()-0.5)*12,hover+(Math.random()-0.5)*12,1,0,Math.PI*2); ctx.fill();}
  }

  ctx.restore();

  let bw = Math.max(s * 2.5, 16);
  let bh = 3;
  let bx = cx - bw/2;
  let barOffset = name === 'Titan' ? 22 : name === 'Mech' ? 18 : name === 'Drone' ? 12 : s + 6;
  let by = cy - barOffset;
  ctx.fillStyle = '#300';
  ctx.fillRect(bx, by, bw, bh);
  let hpRatio = e.hp / e.maxHp;
  ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00';
  ctx.fillRect(bx, by, bw * hpRatio, bh);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bx, by, bw, bh);
}

// ============ MAIN DRAW ============
export function draw() {
  ctx.fillStyle = '#060612';
  ctx.fillRect(0, 0, C.width, C.height);

  // Circuit board grid lines with dot accents
  ctx.strokeStyle = '#0e0e28';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*TILE,0); ctx.lineTo(x*TILE,C.height); ctx.stroke(); }
  for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*TILE); ctx.lineTo(C.width,y*TILE); ctx.stroke(); }
  // Circuit dots at intersections
  ctx.fillStyle = '#14143a';
  for (let x = 0; x <= COLS; x+=2) for (let y = 0; y <= ROWS; y+=2) { ctx.beginPath(); ctx.arc(x*TILE,y*TILE,1.2,0,Math.PI*2); ctx.fill(); }
  // Pulsing circuit lines (horizontal + vertical randomly placed)
  ctx.strokeStyle = hexColor('#1a1a55', 0.5 + Math.sin(s.gameTime*0.03)*0.3);
  ctx.lineWidth = 0.8;
  [2,5,8,12,16,19].forEach(x=>{ctx.beginPath(); ctx.moveTo(x*TILE,0); ctx.lineTo(x*TILE,C.height); ctx.stroke();});
  [1,4,7,10,13].forEach(y=>{ctx.beginPath(); ctx.moveTo(0,y*TILE); ctx.lineTo(C.width,y*TILE); ctx.stroke();});

  PATH.forEach(([c,r], idx) => {
    let grd = ctx.createLinearGradient(c*TILE, r*TILE, c*TILE+TILE, r*TILE+TILE);
    grd.addColorStop(0, '#141428');
    grd.addColorStop(0.5, '#1e1e3a');
    grd.addColorStop(1, '#141428');
    ctx.fillStyle = grd;
    ctx.fillRect(c*TILE+1, r*TILE+1, TILE-2, TILE-2);
    // Subtle road texture lines
    ctx.strokeStyle = '#1a1a35'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(c*TILE+4,r*TILE+4); ctx.lineTo(c*TILE+TILE-4,r*TILE+4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c*TILE+4,r*TILE+TILE-4); ctx.lineTo(c*TILE+TILE-4,r*TILE+TILE-4); ctx.stroke();

    if (idx % 4 === 0 && idx < PATH.length - 1) {
      let [nc,nr] = PATH[Math.min(idx+1, PATH.length-1)];
      if (nc !== c) {
        ctx.fillStyle = '#2a2a50';
        ctx.fillRect(c*TILE + 4, r*TILE + TILE/2 - 1, TILE - 8, 2);
      } else {
        ctx.fillStyle = '#2a2a50';
        ctx.fillRect(c*TILE + TILE/2 - 1, r*TILE + 4, 2, TILE - 8);
      }
    }
  });

  ctx.strokeStyle = '#2a2a55';
  ctx.lineWidth = 1;
  PATH.forEach(([c,r]) => {
    let top = !pathSet.has(c+','+(r-1));
    let bot = !pathSet.has(c+','+(r+1));
    let lft = !pathSet.has((c-1)+','+r);
    let rgt = !pathSet.has((c+1)+','+r);
    if (top) { ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE); ctx.lineTo((c+1)*TILE, r*TILE); ctx.stroke(); }
    if (bot) { ctx.beginPath(); ctx.moveTo(c*TILE, (r+1)*TILE); ctx.lineTo((c+1)*TILE, (r+1)*TILE); ctx.stroke(); }
    if (lft) { ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE); ctx.lineTo(c*TILE, (r+1)*TILE); ctx.stroke(); }
    if (rgt) { ctx.beginPath(); ctx.moveTo((c+1)*TILE, r*TILE); ctx.lineTo((c+1)*TILE, (r+1)*TILE); ctx.stroke(); }
  });

  ctx.fillStyle = '#2a2a4a';
  for (let i = 0; i < PATH.length - 1; i += 3) {
    let [c,r] = PATH[i];
    let [nc,nr] = PATH[Math.min(i+1, PATH.length-1)];
    let ccx = c*TILE+TILE/2, ccy = r*TILE+TILE/2;
    let angle = Math.atan2((nr-r), (nc-c));
    ctx.save();
    ctx.translate(ccx, ccy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(8,0); ctx.lineTo(-4,-5); ctx.lineTo(-4,5);
    ctx.fill();
    ctx.restore();
  }

  s.mines.forEach(m => {
    ctx.save();
    ctx.translate(m.x, m.y);
    if (m.detonated) {
      let alpha = m.flashTimer / 12;
      ctx.fillStyle = hexColor('#f80', alpha * 0.6);
      ctx.beginPath(); ctx.arc(0, 0, MINE_DEF.splashRadius * alpha, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = hexColor('#f42', alpha);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, MINE_DEF.splashRadius * (1 - alpha * 0.5), 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      return;
    }
    let armPulse = m.armed ? Math.sin(s.gameTime * 0.15) * 0.3 + 0.7 : 0.3;
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      let a = (i/4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*2, Math.sin(a)*2);
      ctx.lineTo(Math.cos(a)*7, Math.sin(a)*7);
      ctx.stroke();
    }
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = m.armed ? hexColor('#f42', armPulse) : '#622';
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
    if (m.armed) {
      ctx.shadowColor = '#f42';
      ctx.shadowBlur = 6 + armPulse * 4;
      ctx.fillStyle = hexColor('#f42', armPulse);
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      if (Math.sin(s.gameTime * 0.2) > 0) {
        ctx.fillStyle = '#f00';
        ctx.beginPath(); ctx.arc(5, -5, 1.2, 0, Math.PI*2); ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#f42';
      ctx.lineWidth = 1.5;
      let progress = 1 - (m.armTimer / 60);
      ctx.beginPath();
      ctx.arc(0, 0, 10, -Math.PI/2, -Math.PI/2 + Math.PI*2*progress);
      ctx.stroke();
    }
    ctx.fillStyle = '#aa0';
    for (let i = 0; i < 3; i++) {
      let a = (i/3)*Math.PI*2 - Math.PI/2;
      let tx = Math.cos(a)*8, ty = Math.sin(a)*8;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 1.5);
      ctx.lineTo(tx - 1.5, ty + 1);
      ctx.lineTo(tx + 1.5, ty + 1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  s.towers.forEach(drawTower);

  let sortedEnemies = [...s.enemies].sort((a,b) => a.y - b.y);
  sortedEnemies.forEach(drawRobot);

  s.bullets.forEach(b => {
    b.trail.forEach(t => {
      ctx.globalAlpha = t.life / 8 * 0.5;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 1.5 * (t.life/8), 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();

    if (b.towerId === 'plasma') {
      ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 1.5, 0, Math.PI*2);
      ctx.fill();
    } else if (b.towerId === 'rail') {
      let angle = Math.atan2(b.ty - b.y, b.tx - b.x);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      ctx.fillRect(-6, -2, 12, 4);
      ctx.restore();
    } else if (b.towerId === 'emp') {
      ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = hexColor('#ff0', 0.4);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI*2);
      ctx.stroke();
    } else if (b.towerId === 'cryo') {
      ctx.arc(b.x, b.y, 3.5, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        let a = (i/6)*Math.PI*2 + s.gameTime*0.15;
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(a)*2, b.y + Math.sin(a)*2);
        ctx.lineTo(b.x + Math.cos(a)*6, b.y + Math.sin(a)*6);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, 1.5, 0, Math.PI*2); ctx.fill();
    } else if (b.towerId === 'missile') {
      let a = b.angle !== undefined ? b.angle : Math.atan2(b.ty - b.y, b.tx - b.x);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      ctx.fillStyle = '#ddd';
      ctx.fillRect(-5, -2, 8, 4);
      ctx.fillStyle = '#f92';
      ctx.beginPath();
      ctx.moveTo(3, -2); ctx.lineTo(7, 0); ctx.lineTo(3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.moveTo(-5, -2); ctx.lineTo(-7, -4); ctx.lineTo(-3, -2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, 2); ctx.lineTo(-7, 4); ctx.lineTo(-3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fa0';
      ctx.beginPath();
      ctx.moveTo(-5, -1.5); ctx.lineTo(-9 - Math.random()*3, 0); ctx.lineTo(-5, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  });

  s.particles.forEach(p => {
    let alpha = Math.min(1, p.life / 15);
    ctx.globalAlpha = alpha;
    if (p.ring) {
      // Shockwave ring
      let ringAlpha = (p.life / p.maxLife);
      ctx.globalAlpha = ringAlpha * 0.7;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5 * ringAlpha;
      ctx.shadowColor = p.color; ctx.shadowBlur = 8 * ringAlpha;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.ringR, 0, Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;
      p.ringR += p.ringMax / p.maxLife * 1.8;
    } else if (p.spark) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
    } else if (p.glow) {
      let sz = p.size || 2;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = sz * 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, sz * 0.6, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      let sz = p.size || 2;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - sz/2, p.y - sz/2, sz, sz);
    }
  });
  ctx.globalAlpha = 1;

  // Animated IN marker
  let inPulse = Math.sin(s.gameTime * 0.1) * 0.3 + 0.7;
  ctx.fillStyle = hexColor('#00ff44', inPulse * 0.25);
  ctx.fillRect(PATH[0][0]*TILE, PATH[0][1]*TILE, TILE, TILE);
  ctx.strokeStyle = hexColor('#00ff44', inPulse); ctx.lineWidth = 2;
  ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 8 * inPulse;
  ctx.strokeRect(PATH[0][0]*TILE+1, PATH[0][1]*TILE+1, TILE-2, TILE-2);
  ctx.shadowBlur = 0;

  let last = PATH[PATH.length-1];
  // Animated OUT marker
  let outPulse = Math.sin(s.gameTime * 0.1 + Math.PI) * 0.3 + 0.7;
  ctx.fillStyle = hexColor('#ff2200', outPulse * 0.25);
  ctx.fillRect(last[0]*TILE, last[1]*TILE, TILE, TILE);
  ctx.strokeStyle = hexColor('#ff2200', outPulse); ctx.lineWidth = 2;
  ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 8 * outPulse;
  ctx.strokeRect(last[0]*TILE+1, last[1]*TILE+1, TILE-2, TILE-2);
  ctx.shadowBlur = 0;

  ctx.font = 'bold 10px Courier New';
  ctx.fillStyle = hexColor('#00ff44', inPulse);
  ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 4;
  ctx.fillText('IN', PATH[0][0]*TILE+10, PATH[0][1]*TILE+22);
  ctx.shadowBlur = 0;
  ctx.fillStyle = hexColor('#ff2200', outPulse);
  ctx.fillText('OUT', last[0]*TILE+8, last[1]*TILE+22);

  document.getElementById('money')!.textContent = String(s.money);
  document.getElementById('wave')!.textContent = String(s.waveNum);
  document.getElementById('lives')!.textContent = String(s.lives);
  document.getElementById('score')!.textContent = String(s.score);
  document.getElementById('msg')!.textContent = s.msgTimer > 0 ? s.msg : '';
}

// loop() and setSpeed() are defined in main.ts