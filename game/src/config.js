// config.js — every constant for Wok Rush lives here.
export const CONFIG = {
  shiftSeconds: 180,
  orderTimeMax: 40,
  maxOrders: 3,
  maxPlate: 4,
  firstOrderDelay: 3,
  baseSpawnInterval: 14,
  minSpawnInterval: 9,
  rushHourSeconds: 30,
  rushSpawnFactor: 0.6,
  streakStep: 0.5,
  streakMax: 2.5,
  streakStart: 1.0,
  startLives: 3,
  levelEvery: 6,
  perfectBonus: 1.5,
};

export function spawnIntervalSeconds(level, rushHour) {
  const base = Math.max(
    CONFIG.minSpawnInterval,
    CONFIG.baseSpawnInterval - level,
  );
  return rushHour ? base * CONFIG.rushSpawnFactor : base;
}

export function levelFor(dishesServed) {
  return 1 + Math.floor(dishesServed / CONFIG.levelEvery);
}

// Small deterministic RNG (mulberry32) so staged shots are reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
