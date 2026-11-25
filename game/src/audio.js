// audio.js — all sounds are WebAudio tones, no audio files.
// Background music is a quiet pentatonic loop. It only ever starts from
// startMusic(), which callers invoke from a user gesture (START click /
// Enter), so the browser never sees an autoplay attempt.
export function createAudio() {
  return {
    ctx: null,
    muted: false,
    musicGain: null,
    musicTimer: null,
    musicStep: 0,
    musicNextTime: 0,
    musicOn: false,
    musicLevel: -1,
  };
}

function ensureCtx(audio) {
  if (!audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
    } catch (err) {
      audio.ctx = null;
    }
  }
  if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume();
  return audio.ctx;
}

function tone(audio, freq, startAt, duration, type = "sine", volume = 0.12) {
  const ctx = ensureCtx(audio);
  if (!ctx || audio.muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.02);
}

export function playCue(audio, cue) {
  if (audio.muted) return;
  switch (cue) {
    case "click":
      tone(audio, 700, 0, 0.06, "square", 0.06);
      break;
    case "pop":
      tone(audio, 420, 0, 0.08, "sine", 0.14);
      tone(audio, 640, 0.05, 0.08, "sine", 0.1);
      break;
    case "serve":
      tone(audio, 880, 0, 0.12, "sine", 0.14);
      tone(audio, 1174, 0.1, 0.12, "sine", 0.14);
      tone(audio, 1568, 0.2, 0.2, "sine", 0.14);
      break;
    case "error":
      tone(audio, 160, 0, 0.22, "sawtooth", 0.12);
      break;
    case "expire":
      tone(audio, 220, 0, 0.3, "triangle", 0.14);
      tone(audio, 165, 0.15, 0.35, "triangle", 0.12);
      break;
    case "tick":
      tone(audio, 1000, 0, 0.04, "square", 0.05);
      break;
    case "end":
      tone(audio, 523, 0, 0.15, "sine", 0.12);
      tone(audio, 392, 0.15, 0.15, "sine", 0.12);
      tone(audio, 330, 0.3, 0.3, "sine", 0.12);
      break;
    default:
      break;
  }
}

// ---------------------------------------------------------------- music loop
// Slow pentatonic arpeggio, one soft note every half second. A null step is
// a rest so the loop breathes instead of running note-to-note.
const MUSIC_NOTES = [
  523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0, 392.0,
  440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0, null,
];
const MUSIC_STEP_SECONDS = 0.5;
const MUSIC_LEVEL = 0.35; // master music gain; note gain below keeps it quiet

function scheduleMusicNote(audio, freq, when, duration) {
  const ctx = audio.ctx;
  if (!ctx || !audio.musicGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(0.14, when + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
  osc.connect(gain);
  gain.connect(audio.musicGain);
  osc.start(when);
  osc.stop(when + duration + 0.05);
}

function musicTick(audio) {
  const ctx = audio.ctx;
  if (!ctx || !audio.musicOn) return;
  // Schedule ahead so timing stays steady even if the tab jitters.
  while (audio.musicNextTime < ctx.currentTime + 0.7) {
    const freq = MUSIC_NOTES[audio.musicStep % MUSIC_NOTES.length];
    if (freq) scheduleMusicNote(audio, freq, audio.musicNextTime, 0.48);
    // Soft bass root every 8 steps (once per 4 seconds).
    if (audio.musicStep % 8 === 0) {
      scheduleMusicNote(audio, 130.81, audio.musicNextTime, 1.8);
    }
    audio.musicStep += 1;
    audio.musicNextTime += MUSIC_STEP_SECONDS;
  }
}

export function startMusic(audio) {
  const ctx = ensureCtx(audio);
  if (!ctx) return false;
  try {
    if (!audio.musicGain) {
      audio.musicGain = ctx.createGain();
      audio.musicGain.gain.value = audio.muted ? 0 : MUSIC_LEVEL;
      audio.musicGain.connect(ctx.destination);
    }
    if (audio.musicOn) {
      if (ctx.state === "suspended") ctx.resume();
      return true;
    }
    audio.musicOn = true;
    audio.musicStep = 0;
    audio.musicNextTime = ctx.currentTime + 0.1;
    audio.musicTimer = window.setInterval(() => musicTick(audio), 200);
    musicTick(audio);
    return true;
  } catch (err) {
    audio.musicOn = false;
    return false;
  }
}

export function stopMusic(audio) {
  audio.musicOn = false;
  if (audio.musicTimer !== null) {
    window.clearInterval(audio.musicTimer);
    audio.musicTimer = null;
  }
  if (audio.musicGain) {
    try {
      audio.musicGain.gain.value = 0;
    } catch (err) {
      /* gain already gone */
    }
  }
}

// Called every frame from the main loop: music stays silent while muted,
// paused, or after the shift ends, and quiet while playing.
export function syncMusic(audio, active) {
  if (!audio.musicGain || !audio.musicOn) return;
  const target = audio.muted || !active ? 0 : MUSIC_LEVEL;
  if (target !== audio.musicLevel) {
    audio.musicLevel = target;
    audio.musicGain.gain.setTargetAtTime(target, audio.ctx.currentTime, 0.1);
  }
}
