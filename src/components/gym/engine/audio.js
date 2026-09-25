/**
 * Chiptune sound: WebAudio oscillators only, no audio files. Square and
 * triangle waves for the melody and bass, filtered noise for drums and hits.
 * The context is created lazily on the first user gesture.
 */

const NOTE_INDEX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = (note) => {
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 0;
  const midi = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * 2 ** ((midi - 69) / 12);
};

/*
 * Tracks are bars of eighth notes. '-' is a rest, '.' holds the previous note.
 * Drums use k (kick), s (snare), h (hat) per sixteenth.
 */
const TRACKS = {
  street: {
    bpm: 92,
    lead: [
      'E4 . G4 . A4 . . - ', 'C5 . B4 . A4 . G4 . ', 'E4 . G4 . A4 . . - ', 'D5 . C5 . B4 . . . ',
      'E4 . G4 . A4 . . - ', 'C5 . B4 . A4 . E5 . ', 'D5 . . C5 B4 . A4 . ', 'A4 . . . - - - - ',
    ],
    bass: [
      'A2 . A2 . E3 . A2 . ', 'F2 . F2 . C3 . F2 . ', 'C3 . C3 . G3 . C3 . ', 'G2 . G2 . D3 . G2 . ',
      'A2 . A2 . E3 . A2 . ', 'F2 . F2 . C3 . F2 . ', 'G2 . G2 . D3 . G2 . ', 'E2 . E2 . B2 . E2 . ',
    ],
    drums: ['k...h...s...h...', 'k...h.k.s...h...'],
    leadVol: 0.07,
  },
  gym: {
    bpm: 118,
    lead: [
      'A4 - C5 E5 D5 - C5 B4 ', 'A4 . . G4 A4 - C5 - ', 'B4 - D5 G5 F5 - E5 D5 ', 'E5 . . . G#4 - B4 - ',
      'A4 - C5 E5 D5 - C5 B4 ', 'A4 . . G4 A4 - E5 - ', 'F5 - E5 D5 C5 - B4 C5 ', 'A4 . . . - - E4 - ',
    ],
    bass: [
      'A2 - A2 E3 A2 - G2 A2 ', 'F2 - F2 C3 F2 - E2 F2 ', 'G2 - G2 D3 G2 - F2 G2 ', 'E2 - E2 B2 E2 - G#2 B2 ',
      'A2 - A2 E3 A2 - G2 A2 ', 'F2 - F2 C3 F2 - E2 F2 ', 'D3 - D3 A2 G2 - G2 B2 ', 'A2 - E2 A2 E3 - A2 - ',
    ],
    drums: ['k...h.h.s...h.h.', 'k...h.h.s..kh.hs'],
    leadVol: 0.06,
  },
  battle: {
    bpm: 152,
    lead: [
      'A4 C5 E5 A5 G5 E5 C5 E5 ', 'F4 A4 C5 F5 E5 C5 A4 C5 ', 'G4 B4 D5 G5 F5 D5 B4 D5 ', 'E5 . D5 . C5 . B4 . ',
      'A4 C5 E5 A5 G5 E5 C5 E5 ', 'F4 A4 C5 F5 E5 C5 A4 C5 ', 'D5 . E5 . F5 . G#5 . ', 'A5 . . . E5 - - - ',
    ],
    bass: [
      'A2 A3 A2 A3 A2 A3 A2 A3 ', 'F2 F3 F2 F3 F2 F3 F2 F3 ', 'G2 G3 G2 G3 G2 G3 G2 G3 ', 'E2 E3 E2 E3 E2 E3 G#2 B2 ',
      'A2 A3 A2 A3 A2 A3 A2 A3 ', 'F2 F3 F2 F3 F2 F3 F2 F3 ', 'D3 D3 E3 E3 F3 F3 G#2 G#2 ', 'A2 A2 E2 E2 A2 - A2 - ',
    ],
    drums: ['k.h.s.h.k.k.s.h.', 'k.h.s.h.k.hks.ss'],
    leadVol: 0.055,
  },
};

const parseBar = (bar) => bar.trim().split(/\s+/);

export function createAudio({ muted = false, music = true } = {}) {
  let ctx = null;
  let master = null;
  let sfxBus = null;
  let musicBus = null;
  let noiseBuffer = null;
  let isMuted = muted;
  let musicOn = music;
  let current = null;
  let timer = 0;
  let hiddenSuspended = false;

  function ensure() {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = isMuted ? 0 : 0.6;
      master.connect(ctx.destination);
      sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.42;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = musicOn ? 1 : 0;
      musicBus.connect(master);
      const length = ctx.sampleRate * 0.5;
      noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended' && !hiddenSuspended) ctx.resume().catch(() => {});
    return ctx;
  }

  function tone({ f, f2, at = 0, d = 0.08, type = 'square', v = 0.3, bus, attack = 0.004 }) {
    const c = ensure();
    if (!c || !f) return;
    const start = c.currentTime + at;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, start);
    if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), start + d);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(v, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + d);
    osc.connect(gain).connect(bus || sfxBus);
    osc.start(start);
    osc.stop(start + d + 0.03);
  }

  function noise({ at = 0, d = 0.08, v = 0.25, filter = 'highpass', cutoff = 4000, bus }) {
    const c = ensure();
    if (!c) return;
    const start = c.currentTime + at;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer;
    const biquad = c.createBiquadFilter();
    biquad.type = filter;
    biquad.frequency.value = cutoff;
    const gain = c.createGain();
    gain.gain.setValueAtTime(v, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + d);
    src.connect(biquad).connect(gain).connect(bus || sfxBus);
    src.start(start);
    src.stop(start + d + 0.02);
  }

  const arp = (notes, step = 0.07, opts = {}) =>
    notes.forEach((n, i) => tone({ f: freq(n), at: i * step, d: step * 1.6, ...opts }));

  const SFX = {
    blip: () => tone({ f: 1320, d: 0.025, v: 0.05 }),
    move: () => tone({ f: 880, d: 0.035, v: 0.12 }),
    select: () => {
      tone({ f: 988, d: 0.05, v: 0.16 });
      tone({ f: 1480, at: 0.05, d: 0.07, v: 0.14 });
    },
    back: () => tone({ f: 660, f2: 440, d: 0.08, v: 0.14 }),
    bump: () => tone({ f: 110, f2: 70, d: 0.09, v: 0.22 }),
    door: () => {
      noise({ d: 0.18, v: 0.12, filter: 'bandpass', cutoff: 900 });
      arp(['E4', 'A4', 'E5'], 0.06, { v: 0.12, type: 'triangle' });
    },
    encounter: () => {
      for (let i = 0; i < 10; i++) tone({ f: 300 + i * 90, at: i * 0.035, d: 0.05, v: 0.12 });
      noise({ at: 0.35, d: 0.3, v: 0.15, filter: 'lowpass', cutoff: 1200 });
    },
    perfect: () => arp(['C6', 'E6', 'G6'], 0.045, { v: 0.14 }),
    good: () => arp(['G5', 'C6'], 0.05, { v: 0.12 }),
    miss: () => tone({ f: 330, f2: 110, d: 0.3, v: 0.2, type: 'sawtooth' }),
    rep: () => {
      noise({ d: 0.07, v: 0.22, filter: 'lowpass', cutoff: 700 });
      tone({ f: 90, f2: 50, d: 0.12, v: 0.3, type: 'triangle' });
    },
    tick: () => tone({ f: 2000, d: 0.02, v: 0.06 }),
    mash: () => tone({ f: 200 + Math.random() * 80, d: 0.03, v: 0.08 }),
    heal: () => arp(['C5', 'E5', 'G5', 'C6', 'E6'], 0.05, { v: 0.1, type: 'triangle' }),
    buff: () => arp(['A4', 'C#5', 'E5', 'A5'], 0.06, { v: 0.12 }),
    faint: () => tone({ f: 600, f2: 60, d: 0.9, v: 0.2, type: 'square' }),
    levelUp: () => arp(['C5', 'E5', 'G5', 'C6', 'G5', 'C6'], 0.09, { v: 0.13 }),
    badge: () => {
      arp(['G4', 'C5', 'E5', 'G5', 'C6'], 0.1, { v: 0.12 });
      arp(['E4', 'G4', 'C5', 'E5', 'G5'], 0.1, { v: 0.06, type: 'triangle' });
    },
    victory: () => {
      const melody = ['C5', 'E5', 'G5', 'E5', 'A5', '-', 'G5', 'B5', 'C6'];
      const lengths = [0.12, 0.12, 0.12, 0.12, 0.36, 0.08, 0.14, 0.14, 0.7];
      let t = 0;
      melody.forEach((n, i) => {
        if (n !== '-') tone({ f: freq(n) * 2, at: t, d: lengths[i] * 0.95, v: 0.12 });
        if (n !== '-') tone({ f: freq(n), at: t, d: lengths[i] * 0.95, v: 0.07, type: 'triangle' });
        t += lengths[i];
      });
    },
    pr: () => {
      arp(['C5', 'G5', 'C6', 'E6', 'G6', 'C7'], 0.07, { v: 0.12 });
      noise({ at: 0.4, d: 0.5, v: 0.08, filter: 'highpass', cutoff: 6000 });
    },
  };

  /* ------------------------------------------------------------ music */

  function scheduleTrack(track) {
    const c = ensure();
    if (!c) return;
    const beat = 60 / track.bpm;
    const eighth = beat / 2;
    const sixteenth = beat / 4;
    const bars = track.lead.length;
    let bar = 0;
    let barTime = c.currentTime + 0.08;
    let prevLead = null;
    let prevBass = null;

    const scheduleBar = () => {
      const lead = parseBar(track.lead[bar]);
      const bass = parseBar(track.bass[bar]);
      const drums = track.drums[bar % track.drums.length];
      const lengthOf = (steps, i) => {
        let n = 1;
        while (steps[i + n] === '.') n++;
        return n;
      };
      lead.forEach((n, i) => {
        if (n === '-' || n === '.') return;
        const len = lengthOf(lead, i) * eighth;
        tone({ f: freq(n), at: barTime + i * eighth - c.currentTime, d: len * 0.92, v: track.leadVol, bus: musicBus, attack: 0.01 });
        prevLead = n;
      });
      bass.forEach((n, i) => {
        if (n === '-' || n === '.') return;
        const len = lengthOf(bass, i) * eighth;
        tone({ f: freq(n), at: barTime + i * eighth - c.currentTime, d: len * 0.85, v: 0.11, type: 'triangle', bus: musicBus, attack: 0.005 });
        prevBass = n;
      });
      [...drums].forEach((d, i) => {
        const at = barTime + i * sixteenth - c.currentTime;
        if (d === 'k') tone({ f: 150, f2: 45, at, d: 0.14, v: 0.22, type: 'sine', bus: musicBus });
        if (d === 's') noise({ at, d: 0.1, v: 0.09, filter: 'bandpass', cutoff: 1800, bus: musicBus });
        if (d === 'h') noise({ at, d: 0.03, v: 0.035, filter: 'highpass', cutoff: 7000, bus: musicBus });
      });
      void prevLead;
      void prevBass;
      barTime += eighth * 8;
      bar = (bar + 1) % bars;
    };

    clearInterval(timer);
    timer = setInterval(() => {
      if (!ctx) return;
      while (barTime < ctx.currentTime + 0.6) scheduleBar();
    }, 120);
    scheduleBar();
  }

  return {
    unlock() {
      const had = !!ctx;
      ensure();
      if (!had && current && TRACKS[current]) scheduleTrack(TRACKS[current]);
    },
    play(name) {
      if (isMuted || !ctx) return;
      SFX[name]?.();
    },
    music(name) {
      if (current === name) return;
      current = name;
      clearInterval(timer);
      timer = 0;
      if (!name || !TRACKS[name] || !ctx) return;
      scheduleTrack(TRACKS[name]);
    },
    get track() {
      return current;
    },
    get muted() {
      return isMuted;
    },
    get musicOn() {
      return musicOn;
    },
    setMuted(value) {
      isMuted = value;
      if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 0.6, ctx.currentTime, 0.02);
    },
    setMusic(value) {
      musicOn = value;
      if (musicBus && ctx) musicBus.gain.setTargetAtTime(value ? 1 : 0, ctx.currentTime, 0.05);
    },
    suspend() {
      hiddenSuspended = true;
      ctx?.suspend().catch(() => {});
    },
    resume() {
      hiddenSuspended = false;
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    close() {
      clearInterval(timer);
      timer = 0;
      current = null;
      ctx?.close().catch(() => {});
      ctx = null;
    },
  };
}
