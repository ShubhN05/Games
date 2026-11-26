/* Kurukshetra sounds. Every sound is made in code with the Web Audio API (no sound files, no copyright).
   Browsers only allow sound after the player has pressed a key or clicked. */

/* one tone: type, start pitch, end pitch, length (s), loudness, delay, fade-in */
function tone(k, type, f0, f1, dur, vol, delay = 0, attack = 0.004){
  const { c, out, t } = k, t0 = t + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + 0.02);
}
/* one burst of filtered noise: filter type, start pitch, end pitch, sharpness, length, loudness, delay, fade-in */
function hiss(k, filter, f0, f1, q, dur, vol, delay = 0, attack = 0.004){
  const { c, out, t, noise } = k, t0 = t + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noise; s.loop = true; f.type = filter; f.Q.value = q; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.02);
}
const crackle = (k, n, span, vol, from = 0) => { for (let i = 0; i < n; i++) hiss(k, 'highpass', 2600 + Math.random() * 3000, 2000, 0.8, 0.025, vol * (0.5 + Math.random() * 0.5), from + Math.random() * span, 0.002); };

export const RECIPES = {
  /* body */
  whoosh:    k => hiss(k, 'bandpass', 600, 2100, 1.4, 0.13, 0.85, 0, 0.05),
  whooshKick:k => hiss(k, 'bandpass', 380, 1500, 1.1, 0.19, 1.00, 0, 0.07),
  whooshBig: k => { hiss(k, 'bandpass', 250, 2300, 0.9, 0.32, 1.00, 0, 0.12); tone(k, 'sine', 120, 260, 0.28, 0.22, 0, 0.1); },
  punch:     k => { tone(k, 'sine', 180, 52, 0.13, 0.95); hiss(k, 'bandpass', 1900, 700, 0.8, 0.08, 0.80); tone(k, 'triangle', 420, 120, 0.05, 0.30); },
  kick:      k => { tone(k, 'sine', 140, 38, 0.20, 1.00); hiss(k, 'lowpass', 1600, 280, 0.7, 0.14, 0.95); tone(k, 'triangle', 330, 80, 0.07, 0.45); },
  heavy:     k => { tone(k, 'sine', 100, 28, 0.45, 1.00); hiss(k, 'lowpass', 1000, 110, 0.6, 0.38, 1.00); hiss(k, 'highpass', 2400, 2400, 0.7, 0.06, 0.55); tone(k, 'sawtooth', 220, 55, 0.14, 0.30); },
  block:     k => { tone(k, 'square', 880, 640, 0.07, 0.24); tone(k, 'triangle', 2350, 2100, 0.13, 0.28); hiss(k, 'bandpass', 3200, 2500, 4, 0.07, 0.60); tone(k, 'sine', 210, 110, 0.07, 0.40); },
  jump:      k => hiss(k, 'bandpass', 320, 950, 1, 0.15, 0.65, 0, 0.05),
  land:      k => { tone(k, 'sine', 115, 45, 0.11, 0.75); hiss(k, 'lowpass', 520, 140, 0.7, 0.10, 0.60); },
  fall:      k => { tone(k, 'sine', 85, 30, 0.30, 0.85); hiss(k, 'lowpass', 620, 100, 0.7, 0.28, 0.65); tone(k, 'sine', 70, 34, 0.16, 0.35, 0.17); },
  /* powers */
  bow:       k => { tone(k, 'sawtooth', 250, 65, 0.20, 0.70); hiss(k, 'bandpass', 900, 3200, 1.5, 0.24, 0.90, 0.02, 0.03); },
  fire:      k => { hiss(k, 'lowpass', 600, 2100, 0.7, 0.55, 0.65, 0, 0.09); crackle(k, 9, 0.45, 0.30, 0.05); },
  chi:       k => { tone(k, 'sine', 220, 680, 0.32, 0.38, 0, 0.05); tone(k, 'sine', 330, 1020, 0.32, 0.20, 0, 0.05); hiss(k, 'bandpass', 800, 2500, 2, 0.30, 0.28, 0, 0.1); },
  wind:      k => { hiss(k, 'bandpass', 280, 1300, 3, 0.80, 1.80, 0, 0.25); hiss(k, 'bandpass', 950, 450, 5, 0.75, 1.20, 0.10, 0.30); },
  zap:       k => { tone(k, 'sawtooth', 1500, 190, 0.17, 0.26); hiss(k, 'bandpass', 4200, 1500, 2, 0.15, 0.55); crackle(k, 4, 0.14, 0.35); },
  thunder:   k => { hiss(k, 'highpass', 2800, 900, 0.7, 0.10, 0.85); hiss(k, 'lowpass', 520, 60, 0.6, 0.75, 1.00, 0.04); tone(k, 'sawtooth', 90, 34, 0.36, 0.34, 0.02); crackle(k, 6, 0.25, 0.40); },
  sword:     k => { tone(k, 'triangle', 1900, 1840, 0.50, 0.16); tone(k, 'sine', 2870, 2790, 0.40, 0.12); tone(k, 'sine', 4100, 4030, 0.25, 0.07); hiss(k, 'highpass', 1600, 5200, 0.8, 0.20, 0.42, 0, 0.07); },
  explosion: k => { tone(k, 'sine', 72, 22, 0.95, 1.00); hiss(k, 'lowpass', 2300, 90, 0.5, 0.95, 1.00); hiss(k, 'highpass', 1500, 800, 0.7, 0.22, 0.50); crackle(k, 7, 0.5, 0.25, 0.1); },
  splat:     k => { hiss(k, 'lowpass', 1300, 180, 0.9, 0.32, 1.00); tone(k, 'sine', 150, 34, 0.26, 0.85); hiss(k, 'bandpass', 620, 280, 3, 0.22, 0.60, 0.08); },
  /* signals */
  warn:      k => { tone(k, 'square', 880, 880, 0.07, 0.24); tone(k, 'square', 1175, 1175, 0.10, 0.24, 0.09); },
  glint:     k => tone(k, 'sine', 1700, 2650, 0.10, 0.40),
  charge:    k => { tone(k, 'sawtooth', 85, 520, 1.00, 0.24, 0, 0.45); tone(k, 'sine', 170, 1040, 1.00, 0.20, 0, 0.45); hiss(k, 'bandpass', 200, 2600, 1.5, 1.00, 0.35, 0, 0.65); },
  gong:      k => { for (const [f, v, d] of [[110, 0.50, 1.8], [165.4, 0.30, 1.5], [221, 0.22, 1.2], [277, 0.14, 0.9], [333, 0.10, 0.7]]) tone(k, 'sine', f, f * 0.995, d, v, 0, 0.008); hiss(k, 'bandpass', 1300, 600, 1, 0.20, 0.30); },
  fatal:     k => { tone(k, 'sine', 62, 38, 1.50, 0.90, 0, 0.02); tone(k, 'sawtooth', 110, 102, 1.50, 0.18, 0, 0.35); tone(k, 'sine', 116.5, 110, 1.40, 0.22, 0, 0.20); hiss(k, 'lowpass', 300, 1500, 0.8, 1.20, 0.30, 0, 0.9); },
  ko:        k => { tone(k, 'sine', 95, 24, 1.20, 1.00); hiss(k, 'lowpass', 1500, 80, 0.5, 0.90, 0.85); tone(k, 'sine', 82.5, 82, 1.70, 0.40, 0.05, 0.02); tone(k, 'sine', 123.5, 123, 1.40, 0.24, 0.05, 0.02); },
  tick:      k => tone(k, 'square', 640, 620, 0.035, 0.30),
  confirm:   k => { tone(k, 'triangle', 520, 780, 0.12, 0.34); tone(k, 'triangle', 780, 1180, 0.15, 0.24, 0.06); } };

/* connects the sounds to a (live or offline) audio context */
export function buildBus(c){
  const comp = c.createDynamicsCompressor(), master = c.createGain(); comp.threshold.value = -14; comp.ratio.value = 6; master.gain.value = 1.0; master.connect(comp); comp.connect(c.destination);
  const noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return { master, noise };
}

export function createSfx(){
  let ctx = null, bus = null, on = true; const last = {}, count = {};
  try { on = localStorage.getItem('kurukshetraSound') !== 'off'; } catch (e) {}
  function unlock(){
    try { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC(); bus = buildBus(ctx); } if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; }
  }
  addEventListener('keydown', unlock); addEventListener('pointerdown', unlock);
  /* announcer: the computer's own voice (only a voice stored on this device is used) */
  function say(text){
    count['say:' + text] = (count['say:' + text] || 0) + 1;
    const S = window.speechSynthesis; if (!on || !S || !ctx) return;
    const local = S.getVoices().filter(v => v.localService && /^en/i.test(v.lang)); if (!local.length) return;
    const u = new SpeechSynthesisUtterance(text); u.voice = local.find(v => /david|mark|george|male/i.test(v.name) && !/female/i.test(v.name)) || local[0]; u.pitch = 0.55; u.rate = 0.95; u.volume = 1; S.cancel(); S.speak(u);
  }
  function play(name, vol = 1, gap = 0.035){
    count[name] = (count[name] || 0) + 1;
    if (!on || !ctx || ctx.state !== 'running' || !RECIPES[name]) return false;
    const t = ctx.currentTime; if (t - (last[name] ?? -9) < gap) return false; last[name] = t;       // the same sound does not stack up
    const out = ctx.createGain(); out.gain.value = vol; out.connect(bus.master); RECIPES[name]({ c: ctx, out, t, noise: bus.noise }); return true;
  }
  function toggle(){ on = !on; try { localStorage.setItem('kurukshetraSound', on ? 'on' : 'off'); } catch (e) {} if (!on && window.speechSynthesis) speechSynthesis.cancel(); if (bus) bus.master.gain.value = on ? 1.0 : 0; if (on) unlock(); return on; }
  return { play, say, toggle, unlock, count, get on() { return on; }, get state() { return ctx ? ctx.state : 'none'; } };
}
