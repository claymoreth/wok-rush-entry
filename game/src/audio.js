// audio.js — all sounds are WebAudio tones, no audio files.
export function createAudio() {
  return { ctx: null, muted: false };
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
