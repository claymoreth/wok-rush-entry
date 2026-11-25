// shots.js — deterministic staged states for ?shot=title|play|serve|end&seed=1.
import { CONFIG } from "./config.js";
import { RECIPES } from "./recipes.js";
import { createGame } from "./state.js";

function pickRecipe(game, index) {
  return RECIPES[index % RECIPES.length];
}

export function applyShot(game, shot, seed) {
  const staged = createGame(seed);
  staged.phase = "playing";
  staged.timeLeft = 167;
  staged.score = 1240;
  staged.streak = 1.5;
  staged.bestStreak = 1.5;
  staged.level = 2;
  staged.served = 6;
  staged.lives = 3;
  staged.spawnTimer = 8;

  if (shot === "title") {
    staged.phase = "title";
    staged.timeLeft = CONFIG.shiftSeconds;
    staged.score = 0;
    staged.streak = 1.0;
    staged.bestStreak = 1.0;
    staged.level = 1;
    staged.served = 0;
    Object.assign(game, staged);
    return;
  }

  if (shot === "end") {
    staged.phase = "end";
    staged.timeLeft = 0;
    staged.score = 2480;
    staged.served = 7;
    staged.bestStreak = 2.5;
    staged.streak = 1.0;
    staged.orders = [];
    staged.plate = [];
    Object.assign(game, staged);
    return;
  }

  // play: two live orders, plate holds two ingredients of the first order.
  const first = pickRecipe(staged, seed % RECIPES.length);
  const second = pickRecipe(staged, (seed + 2) % RECIPES.length);
  staged.orders = [
    { uid: 1, recipeId: first.id, timeLeft: 22, timeMax: CONFIG.orderTimeMax },
    { uid: 2, recipeId: second.id, timeLeft: 27, timeMax: CONFIG.orderTimeMax },
  ];
  staged.nextUid = 3;

  if (shot === "serve") {
    staged.plate = [...first.ingredients];
    staged.lastServe = null;
  } else {
    // play
    staged.plate = first.ingredients.slice(0, 2);
  }
  Object.assign(game, staged);
}
