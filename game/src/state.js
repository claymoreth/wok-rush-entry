// state.js — state machine and rules: orders, plate, score, streak, lives.
import { CONFIG, levelFor, mulberry32, spawnIntervalSeconds } from "./config.js";
import { RECIPES, sameIngredients, RECIPE_BY_ID } from "./recipes.js";

export function createGame(seed = 1) {
  const rng = mulberry32(seed);
  return {
    seed,
    rng,
    phase: "title", // title | playing | paused | end
    timeLeft: CONFIG.shiftSeconds,
    score: 0,
    streak: CONFIG.streakStart,
    bestStreak: CONFIG.streakStart,
    lives: CONFIG.startLives,
    served: 0,
    level: 1,
    orders: [], // { uid, recipeId, timeLeft, timeMax }
    plate: [], // ingredient ids, max 4, no duplicates
    nextUid: 1,
    spawnTimer: CONFIG.firstOrderDelay,
    muted: false,
    lastServe: null, // { name, points, perfect } for the toast popup
    toastTimer: 0,
    shakeTimer: 0,
    tickSoundAt: 0,
    events: [], // one-frame sound cues consumed by main.js
  };
}

export function resetGame(game) {
  const fresh = createGame(game.seed);
  fresh.muted = game.muted;
  Object.assign(game, fresh);
}

export function startShift(game) {
  resetGame(game);
  game.phase = "playing";
}

export function addIngredient(game, ingredientId) {
  if (game.phase !== "playing") return false;
  if (game.plate.length >= CONFIG.maxPlate) return false;
  if (game.plate.includes(ingredientId)) return false;
  game.plate.push(ingredientId);
  game.events.push("pop");
  return true;
}

export function clearPlate(game) {
  if (game.phase !== "playing") return;
  game.plate = [];
  game.events.push("click");
}

export function matchingOrder(game) {
  for (const order of game.orders) {
    const recipe = RECIPE_BY_ID[order.recipeId];
    if (sameIngredients(game.plate, recipe.ingredients)) return order;
  }
  return null;
}

export function servePlate(game) {
  if (game.phase !== "playing") return null;
  if (game.plate.length === 0) return null;
  const order = matchingOrder(game);
  if (!order) {
    game.shakeTimer = 0.35;
    game.events.push("error");
    return { ok: false };
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const perfect = order.timeLeft > order.timeMax / 2;
  const points = Math.round(
    recipe.price * game.streak * (perfect ? CONFIG.perfectBonus : 1),
  );
  game.score += points;
  game.served += 1;
  game.streak = Math.min(
    CONFIG.streakMax,
    game.streak + CONFIG.streakStep,
  );
  game.bestStreak = Math.max(game.bestStreak, game.streak);
  game.level = levelFor(game.served);
  game.orders = game.orders.filter((o) => o.uid !== order.uid);
  game.plate = [];
  game.lastServe = { name: recipe.name, points, perfect };
  game.toastTimer = 1.6;
  game.events.push("serve");
  return { ok: true, name: recipe.name, points, perfect };
}

  // spawnOrder never duplicates a recipe already on the board: with at most
// 3 tickets and 7 recipes there is always another recipe to pick.
function spawnOrder(game) {
  const taken = new Set(game.orders.map((o) => o.recipeId));
  const choices = RECIPES.filter((r) => !taken.has(r.id));
  const pool = choices.length > 0 ? choices : RECIPES;
  const recipe = pool[Math.floor(game.rng() * pool.length)];
  game.orders.push({
    uid: game.nextUid,
    recipeId: recipe.id,
    timeLeft: CONFIG.orderTimeMax,
    timeMax: CONFIG.orderTimeMax,
    faceId: Math.floor(game.rng() * 4),
  });
  game.nextUid += 1;
}

export function tick(game, dt) {
  if (game.phase !== "playing") return;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.phase = "end";
    game.events.push("end");
    return;
  }
  const rushHour = game.timeLeft <= CONFIG.rushHourSeconds;
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0 && game.orders.length < CONFIG.maxOrders) {
    spawnOrder(game);
    game.spawnTimer = spawnIntervalSeconds(game.level, rushHour);
  }
  const expired = [];
  for (const order of game.orders) {
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) expired.push(order);
    else if (order.timeLeft < 10 && Math.floor(order.timeLeft) !== game.tickSoundAt) {
      game.tickSoundAt = Math.floor(order.timeLeft);
      game.events.push("tick");
    }
  }
  if (expired.length > 0) {
    game.orders = game.orders.filter((o) => o.timeLeft > 0);
    game.lives -= expired.length;
    game.streak = CONFIG.streakStart;
    game.events.push("expire");
    if (game.lives <= 0) {
      game.lives = 0;
      game.phase = "end";
    }
  }
  if (game.toastTimer > 0) game.toastTimer -= dt;
  if (game.shakeTimer > 0) game.shakeTimer -= dt;
}

export function rushHour(game) {
  return game.phase === "playing" && game.timeLeft <= CONFIG.rushHourSeconds;
}

export function debugState(game) {
  return {
    phase: game.phase,
    timeLeft: Math.round(game.timeLeft * 10) / 10,
    score: game.score,
    streak: game.streak,
    lives: game.lives,
    level: game.level,
    served: game.served,
    orders: game.orders.map((o) => ({
      recipeId: o.recipeId,
      timeLeft: Math.round(o.timeLeft * 10) / 10,
      timeMax: o.timeMax,
      faceId: o.faceId,
    })),
    plate: [...game.plate],
  };
}
