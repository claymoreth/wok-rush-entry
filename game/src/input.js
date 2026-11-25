// input.js — keyboard and mouse controls.
import { INGREDIENT_BY_KEY } from "./recipes.js";
import { addIngredient, clearPlate, servePlate, startShift, resetGame } from "./state.js";

export function bindInput(game, audio, els) {
  function startOrRestart() {
    if (game.phase === "title" || game.phase === "end") startShift(game);
  }

  function onKey(event) {
    const key = event.key;
    if (key === "m" || key === "M") {
      game.muted = !game.muted;
      audio.muted = game.muted;
      return;
    }
    if (key === "p" || key === "P") {
      if (game.phase === "playing") game.phase = "paused";
      else if (game.phase === "paused") game.phase = "playing";
      return;
    }
    if (game.phase === "title" || game.phase === "end") {
      if (key === "Enter" || key === "r" || key === "R" || key === " ") {
        event.preventDefault();
        startOrRestart();
      }
      return;
    }
    if (game.phase === "paused") return;
    if (INGREDIENT_BY_KEY[key]) {
      event.preventDefault();
      addIngredient(game, INGREDIENT_BY_KEY[key].id);
      return;
    }
    if (key === " " || key === "Enter") {
      event.preventDefault();
      servePlate(game);
      return;
    }
    if (key === "x" || key === "X" || key === "Backspace") {
      event.preventDefault();
      clearPlate(game);
    }
  }

  window.addEventListener("keydown", onKey);

  els.startBtn.addEventListener("click", () => startOrRestart());
  els.againBtn.addEventListener("click", () => startOrRestart());
  els.serveBtn.addEventListener("click", () => servePlate(game));
  els.clearBtn.addEventListener("click", () => clearPlate(game));
  els.pauseBtn.addEventListener("click", () => {
    if (game.phase === "playing") game.phase = "paused";
    else if (game.phase === "paused") game.phase = "playing";
  });
  els.muteBtn.addEventListener("click", () => {
    game.muted = !game.muted;
    audio.muted = game.muted;
  });
  els.ingredientBar.addEventListener("click", (event) => {
    const card = event.target.closest("[data-ingredient]");
    if (!card) return;
    addIngredient(game, card.dataset.ingredient);
  });
  // Keep the game usable after a click anywhere on the stage.
  els.stage.addEventListener("pointerdown", () => {
    if (game.phase === "title" || game.phase === "end") return;
    if (window.__wokRushAudio) window.__wokRushAudio();
  });
  return { startOrRestart };
}
