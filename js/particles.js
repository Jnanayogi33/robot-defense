function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 1 + Math.random() * 3;
    particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 15 + Math.random()*15, color, size: 1+Math.random()*2 });
  }
}

function spawnDeathExplosion(x, y, color, size) {
  let isBig = size >= 18;
  let count = Math.floor(20 + size * 1.5);
  // Fire particles
  for (let i = 0; i < count; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 1.5 + Math.random() * (isBig ? 7 : 4);
    let colors = [color, '#ff8', '#fa0', '#fff', '#f60', '#ff4'];
    particles.push({
      x: x + (Math.random()-0.5)*size*0.8,
      y: y + (Math.random()-0.5)*size*0.8,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 1.5,
      life: 18 + Math.random()*(isBig?35:22),
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 1.5 + Math.random()*(isBig?5:3),
      gravity: 0.06,
      glow: true
    });
  }
  // Smoke
  for (let i = 0; i < (isBig?12:5); i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 1 + Math.random() * (isBig?4:2);
    particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 2.5,
      life: 35 + Math.random()*25, color: isBig?'#555':'#888',
      size: (isBig?4:2) + Math.random()*3, gravity: 0.05 });
  }
  // Shockwave ring
  particles.push({ x, y, ring: true, ringR: 0, ringMax: size * (isBig?3.5:2.5),
    life: isBig?18:12, maxLife: isBig?18:12, color: color });
  // Sparks (fast, short-lived)
  for (let i = 0; i < (isBig?16:6); i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 4 + Math.random() * (isBig?9:5);
    particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 2,
      life: 8 + Math.random()*8, color: '#fff', size: 0.8+Math.random()*1.2, gravity: 0.2, spark: true });
  }
}

function spawnMineExplosion(x, y) {
  for (let i = 0; i < 30; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 2 + Math.random() * 5;
    let colors = ['#f42', '#fa0', '#ff8', '#fff', '#f80', '#f60'];
    particles.push({
      x: x + (Math.random()-0.5)*10,
      y: y + (Math.random()-0.5)*10,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 2,
      life: 20 + Math.random()*25,
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 2 + Math.random()*4,
      gravity: 0.06
    });
  }
  for (let i = 0; i < 10; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 3 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed - 3,
      life: 25 + Math.random()*20,
      color: '#666',
      size: 1.5 + Math.random()*2,
      gravity: 0.15
    });
  }
  for (let i = 0; i < 8; i++) {
    let angle = Math.random() * Math.PI * 2;
    let speed = 0.5 + Math.random() * 2;
    particles.push({
      x: x + (Math.random()-0.5)*15,
      y: y + (Math.random()-0.5)*15,
      vx: Math.cos(angle)*speed,
      vy: -0.5 - Math.random(),
      life: 35 + Math.random()*20,
      color: '#555',
      size: 3 + Math.random()*3,
      gravity: -0.03
    });
  }
}