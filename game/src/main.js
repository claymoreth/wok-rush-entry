// main.js — bootstrap: build DOM, bind input, run the game loop.
import { createGame, tick, debugState } from "./state.js";
import { buildStaticDom, collectElements, render, fitStage } from "./render.js";
import { createAudio, playCue } from "./audio.js";
import { bindInput } from "./input.js";
import { applyShot } from "./shots.js";

const params = new URLSearchParams(window.location.search);
const seed = Number.parseInt(params.get("seed") || "1", 10) || 1;
const shot = params.get("shot");

const game = createGame(seed);
const audio = createAudio();
buildStaticDom();
const els = collectElements();
bindInput(game, audio, els);

if (shot) applyShot(game, shot, seed);

window.__wokRush = {
  get state() {
    return debugState(game);
  },
  game,
};

window.addEventListener("resize", fitStage);
fitStage();

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  tick(game, dt);
  while (game.events.length > 0) playCue(audio, game.events.shift());
  render(game, els);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
