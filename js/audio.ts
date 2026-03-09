// audio.ts — Sound effects and music engine

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

// ── SOUND EFFECTS ──────────────────────────────────────────────────────────
export const Sounds = (() => {
  let audioCtx: AudioContext | null = null;
  function getCtx(): AudioContext {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext!)();
    return audioCtx;
  }
  function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.15, sweep: number | null = null, pan = 0): void {
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      const p = c.createStereoPanner();
      o.type = type;
      o.frequency.value = freq;
      p.pan.value = pan;
      if (sweep) o.frequency.exponentialRampToValueAtTime(sweep, c.currentTime + dur);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g); g.connect(p); p.connect(c.destination);
      o.start(c.currentTime); o.stop(c.currentTime + dur + 0.01);
    } catch (e) { /* ignore */ }
  }
  function noise(dur: number, vol = 0.1, hpFreq = 2000): void {
    try {
      const c = getCtx();
      const len = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      const flt = c.createBiquadFilter();
      const g = c.createGain();
      flt.type = 'highpass'; flt.frequency.value = hpFreq;
      src.buffer = buf; src.connect(flt); flt.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      src.start(c.currentTime); src.stop(c.currentTime + dur);
    } catch (e) { /* ignore */ }
  }
  return {
    shoot(type = 'laser'): void {
      if (type === 'laser' || type === 'pea' || type === 'spark' || type === 'photon')
        tone(type === 'pea' ? 800 : type === 'spark' ? 600 : 1200, 0.06, 'square', 0.08);
      else if (type === 'plasma' || type === 'vortex' || type === 'prism')
        tone(300, 0.12, 'sawtooth', 0.1, 80);
      else if (type === 'emp' || type === 'disruptor')
        tone(400, 0.1, 'sine', 0.1, 150);
      else if (type === 'rail' || type === 'annihilator')
        tone(2000, 0.08, 'sawtooth', 0.14, 200);
      else if (type === 'tesla' || type === 'absoluteZero')
        tone(1800, 0.07, 'square', 0.1, 600);
      else if (type === 'cryo' || type === 'gravity')
        tone(500, 0.14, 'sine', 0.09, 200);
      else if (type === 'missile' || type === 'plasmaRocket') {
        tone(200, 0.15, 'sawtooth', 0.12, 80); noise(0.08, 0.06, 3000);
      }
    },
    explode(size = 8): void {
      const vol = Math.min(0.35, 0.08 + size * 0.008);
      const dur = 0.1 + size * 0.012;
      noise(dur, vol, size > 20 ? 80 : 500);
      tone(size > 20 ? 60 : 150, dur, 'sine', vol * 0.6, 30);
    },
    place(): void { tone(880, 0.04, 'sine', 0.08); tone(1100, 0.04, 'sine', 0.06); },
    waveDone(): void {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'sine', 0.12), i * 100));
    },
    lifeLost(): void { tone(200, 0.3, 'sawtooth', 0.2, 100); },
    overclock(): void {
      [400, 600, 800, 1200, 1600].forEach((f, i) => setTimeout(() => tone(f, 0.08, 'square', 0.15), i * 60));
    },
    fusion(): void {
      [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.18), i * 80));
      setTimeout(() => noise(0.3, 0.12, 5000), 200);
    },
  };
})();

// ── MUSIC ENGINE v2 (high quality) ──────────────────────────────────────────
export const Music = (() => {
  let audioCtx: AudioContext | null = null;
  let master: GainNode | null = null;
  let comp: DynamicsCompressorNode | null = null;
  let reverb: ConvolverNode | null = null;
  let playing = false;
  let loopTimer: ReturnType<typeof setTimeout>;
  const BPM = 138;
  const sixteenth = 60 / BPM / 4;

  const N: Record<string, number> = {
    _: 0, A1: 55, E2: 82.41,
    A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220,
    B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392,
    A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 784, A5: 880,
  };

  function setup(): void {
    audioCtx = new (window.AudioContext || window.webkitAudioContext!)();
    master = audioCtx.createGain(); master.gain.value = 0.72;
    comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 8;
    comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.18;
    master.connect(comp); comp.connect(audioCtx.destination);

    const len = Math.floor(audioCtx.sampleRate * 2.2);
    const rbuf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = rbuf.getChannelData(c);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2) * (c === 0 ? 1 : -1);
    }
    reverb = audioCtx.createConvolver(); reverb.buffer = rbuf;
    const reverbSend = audioCtx.createGain(); reverbSend.gain.value = 0.18;
    reverb.connect(reverbSend); reverbSend.connect(master);
  }

  function osc(freq: number, t: number, dur: number, type: OscillatorType, vol: number, detune = 0, pan = 0, wet = false): void {
    if (!freq || !audioCtx || !master || !reverb) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const p = audioCtx.createStereoPanner();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    p.pan.value = pan;
    o.connect(g); g.connect(p); p.connect(master);
    if (wet) p.connect(reverb);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.setValueAtTime(vol, t + dur * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function kick(t: number): void {
    if (!audioCtx || !master) return;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(master); o.type = 'sine';
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.13);
    g.gain.setValueAtTime(1.0, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.start(t); o.stop(t + 0.22);
    const o2 = audioCtx.createOscillator(); const g2 = audioCtx.createGain();
    o2.connect(g2); g2.connect(master); o2.type = 'sine'; o2.frequency.value = 1400;
    g2.gain.setValueAtTime(0.35, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
    o2.start(t); o2.stop(t + 0.015);
  }

  function snare(t: number): void {
    if (!audioCtx || !master) return;
    const o = audioCtx.createOscillator(); const g1 = audioCtx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.08);
    o.connect(g1); g1.connect(master);
    g1.gain.setValueAtTime(0.45, t);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.start(t); o.stop(t + 0.12);
    const len = Math.floor(audioCtx.sampleRate * 0.22);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource(); const flt = audioCtx.createBiquadFilter(); const g2 = audioCtx.createGain();
    src.buffer = buf; flt.type = 'bandpass'; flt.frequency.value = 3200; flt.Q.value = 0.7;
    src.connect(flt); flt.connect(g2); g2.connect(master);
    if (reverb) flt.connect(reverb);
    g2.gain.setValueAtTime(0.28, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.start(t); src.stop(t + 0.22);
  }

  function hihat(t: number, open = false, vol = 0.07): void {
    if (!audioCtx || !master) return;
    const dur = open ? 0.18 : 0.038;
    const len = Math.floor(audioCtx.sampleRate * (dur + 0.02));
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = audioCtx.createBufferSource(); const flt = audioCtx.createBiquadFilter();
    const g = audioCtx.createGain(); const p = audioCtx.createStereoPanner();
    src.buffer = buf; flt.type = 'highpass'; flt.frequency.value = 9500;
    p.pan.value = 0.25;
    src.connect(flt); flt.connect(g); g.connect(p); p.connect(master);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t); src.stop(t + dur + 0.01);
  }

  const MEL = [
    N.A4, N._, N.C5, N._, N.E5, N._, N.G5, N.E5,
    N.D5, N._, N.B4, N._, N.G4, N._, N.A4, N._,
    N.A4, N.C5, N._, N.E5, N.G5, N._, N.A5, N._,
    N.G5, N.E5, N.D5, N._, N.C5, N._, N.A4, N._,
  ];
  const CTR = [
    N._, N.E4, N._, N.G4, N._, N.C5, N._, N.A4,
    N._, N.G4, N._, N.E4, N._, N.F4, N._, N.E4,
    N._, N.E4, N.G4, N._, N._, N.C5, N._, N.E5,
    N._, N.C5, N._, N.B4, N._, N.G4, N._, N.E4,
  ];
  const BAS = [
    N.A2, N._, N.A2, N._, N.C3, N._, N.C3, N._,
    N.E3, N._, N.E3, N._, N.A2, N._, N.G3, N._,
    N.A2, N._, N.A2, N.E3, N._, N.A3, N._, N.A3,
    N.G3, N._, N.E3, N._, N.D3, N._, N.A2, N._,
  ];
  const CHORDS = [
    [N.A3, N.C4, N.E4], [N.C3, N.E3, N.G3],
    [N.E3, N.G3, N.B3], [N.G3, N.B3, N.D4],
    [N.A3, N.C4, N.E4], [N.A3, N.E4, N.A4],
    [N.D3, N.F4, N.A4], [N.E3, N.G4, N.B4],
  ];

  function scheduleLoop(t0: number): void {
    for (let i = 0; i < 32; i++) {
      const t = t0 + i * sixteenth;
      if (MEL[i]) osc(MEL[i], t, sixteenth * 1.6, 'square', 0.09, 0, -0.2, true);
      if (CTR[i]) osc(CTR[i], t, sixteenth * 1.4, 'square', 0.05, 8, 0.3, true);
      if (BAS[i]) {
        osc(BAS[i], t, sixteenth * 1.95, 'sawtooth', 0.13, 0, 0);
        osc(BAS[i] * 0.5, t, sixteenth * 1.95, 'sine', 0.09, 0, 0);
      }
      if (i % 4 === 0) {
        const ch = CHORDS[Math.floor(i / 4) % CHORDS.length];
        for (const n of ch) osc(n, t, sixteenth * 3.2, 'sawtooth', 0.022, 0, (Math.random() - 0.5) * 0.4, true);
      }
      if (i === 0 || i === 8 || i === 16 || i === 24 || i === 28) kick(t);
      if (i === 4 || i === 12 || i === 20) snare(t);
      if (i % 2 === 0) hihat(t, false, i % 4 === 0 ? 0.09 : 0.06);
      else hihat(t, false, 0.03);
      if (i === 6 || i === 14 || i === 22 || i === 30) hihat(t, true, 0.07);
    }
  }

  function loop(t0: number): void {
    if (!playing) return;
    scheduleLoop(t0);
    const dur = sixteenth * 32;
    loopTimer = setTimeout(() => loop(t0 + dur), (dur - 0.1) * 1000);
  }

  function start(): void {
    if (playing) return;
    if (!audioCtx) setup();
    audioCtx!.resume().then(() => { playing = true; loop(audioCtx!.currentTime + 0.12); });
  }
  function stop(): void { playing = false; clearTimeout(loopTimer); }
  function toggle(): boolean {
    playing ? stop() : start();
    const btn = document.getElementById('music-btn');
    if (btn) btn.textContent = playing ? '🔊' : '🔇';
    return playing;
  }
  return { start, stop, toggle, isPlaying: () => playing };
})();
