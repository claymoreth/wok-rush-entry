// render.js — builds the DOM once, then updates HUD, tickets, plate and screens.
import { INGREDIENTS, RECIPE_BY_ID, INGREDIENT_BY_ID } from "./recipes.js";
import { matchingOrder, rushHour } from "./state.js";

export function buildStaticDom() {
  const bar = document.getElementById("ingbar");
  for (const ing of INGREDIENTS) {
    const card = document.createElement("div");
    card.className = "ingCard";
    card.dataset.ingredient = ing.id;
    card.innerHTML =
      `<span class="key">${ing.key}</span>` +
      `<img src="${ing.icon}" alt="${ing.label}">` +
      `<span class="name">${ing.label}</span>`;
    bar.appendChild(card);
  }
  const hearts = document.getElementById("hearts");
  for (let i = 0; i < 3; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = "♥";
    hearts.appendChild(h);
  }
}

export function collectElements() {
  return {
    stage: document.getElementById("stage"),
    scoreNum: document.getElementById("scoreNum"),
    streakNum: document.getElementById("streakNum"),
    lvlNum: document.getElementById("lvlNum"),
    hearts: document.getElementById("hearts"),
    shiftClock: document.getElementById("shiftClock"),
    orders: document.getElementById("orders"),
    chef: document.getElementById("chef"),
    plateArea: document.getElementById("plateArea"),
    rushBanner: document.getElementById("rushBanner"),
    toast: document.getElementById("toast"),
    serveBtn: document.getElementById("serveBtn"),
    clearBtn: document.getElementById("clearBtn"),
    startBtn: document.getElementById("startBtn"),
    againBtn: document.getElementById("againBtn"),
    pauseBtn: document.getElementById("pauseBtn"),
    muteBtn: document.getElementById("muteBtn"),
    ingredientBar: document.getElementById("ingbar"),
    titleScreen: document.getElementById("titleScreen"),
    endScreen: document.getElementById("endScreen"),
    pauseScreen: document.getElementById("pauseScreen"),
    endStats: document.getElementById("endStats"),
  };
}

function formatScore(score) {
  return String(Math.max(0, Math.floor(score))).padStart(5, "0");
}

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function formatStreak(streak) {
  return "x" + (Number.isInteger(streak) ? String(streak) : streak.toFixed(1));
}

export function render(game, els) {
  els.scoreNum.textContent = formatScore(game.score);
  els.streakNum.textContent = formatStreak(game.streak);
  els.lvlNum.textContent = String(game.level);
  els.shiftClock.textContent = "SHIFT " + formatClock(game.timeLeft);
  const hearts = els.hearts.children;
  for (let i = 0; i < hearts.length; i++) {
    hearts[i].classList.toggle("off", i >= game.lives);
  }
  els.muteBtn.textContent = game.muted ? "✕" : "♪";

  // Order tickets (always 3 slots; empty slots stay hidden).
  const ready = matchingOrder(game);
  els.orders.innerHTML = "";
  for (let slot = 0; slot < 3; slot++) {
    const order = game.orders[slot];
    const ticket = document.createElement("div");
    ticket.className = "ticket";
    if (!order) {
      ticket.classList.add("empty");
      els.orders.appendChild(ticket);
      continue;
    }
    const recipe = RECIPE_BY_ID[order.recipeId];
    const secs = Math.ceil(order.timeLeft);
    const isReady = ready && ready.uid === order.uid;
    const hurry = order.timeLeft < 10;
    if (hurry) ticket.classList.add("hurry");
    if (isReady) ticket.classList.add("ready");
    const rows = recipe.ingredients
      .map((id) => {
        const done = game.plate.includes(id);
        return `<li class="${done ? "done" : ""}"><span class="box${done ? " done" : ""}">${done ? "✓" : ""}</span>${INGREDIENT_BY_ID[id].label}</li>`;
      })
      .join("");
    ticket.innerHTML =
      `<img class="face" src="assets/face-${order.faceId ?? 0}.png" alt="Customer">` +
      `<div class="tname">${recipe.name}</div>` +
      `<div class="timer${hurry ? " low" : ""}">◷ ${secs}s</div>` +
      `<img class="dish" src="${recipe.icon}" alt="${recipe.name}">` +
      `<ul class="ings">${rows}</ul>` +
      (isReady ? `<div class="readyTag">READY ✓</div>` : "");
    els.orders.appendChild(ticket);
  }

  // Plate: ingredient icons on the plate, empty slots as dashed outlines.
  els.plateArea.innerHTML = "";
  els.plateArea.classList.toggle("shake", game.shakeTimer > 0);
  for (let i = 0; i < 4; i++) {
    const id = game.plate[i];
    if (id) {
      const img = document.createElement("img");
      img.src = INGREDIENT_BY_ID[id].icon;
      img.alt = INGREDIENT_BY_ID[id].label;
      els.plateArea.appendChild(img);
    } else {
      const slot = document.createElement("div");
      slot.className = "slot";
      els.plateArea.appendChild(slot);
    }
  }

  // Ingredient cards light up when the ingredient is on the plate.
  for (const card of els.ingredientBar.children) {
    card.classList.toggle("inPlate", game.plate.includes(card.dataset.ingredient));
  }

  els.serveBtn.classList.toggle("ready", Boolean(ready));
  els.rushBanner.style.display = rushHour(game) ? "block" : "none";

  if (game.lastServe && game.toastTimer > 0) {
    els.toast.style.display = "block";
    els.toast.textContent =
      (game.lastServe.perfect ? "PERFECT! " : "") +
      `${game.lastServe.name} +${game.lastServe.points}`;
  } else {
    els.toast.style.display = "none";
  }

  els.titleScreen.classList.toggle("show", game.phase === "title");
  els.endScreen.classList.toggle("show", game.phase === "end");
  els.pauseScreen.classList.toggle("show", game.phase === "paused");
  // The scene chef and plate belong to gameplay; the title screen has its
  // own chef, and the end screen dims the scene, so hide them there.
  const sceneVisible = game.phase === "playing" || game.phase === "paused";
  els.chef.style.display = sceneVisible ? "block" : "none";
  els.plateArea.style.display = sceneVisible ? "flex" : "none";
  if (game.phase === "end") {
    els.endStats.innerHTML =
      `FINAL SCORE: ${formatScore(game.score)}<br>` +
      `DISHES SERVED: ${game.served}<br>` +
      `BEST STREAK: ${formatStreak(game.bestStreak)}`;
  }
}

export function fitStage() {
  const stage = document.getElementById("stage");
  const scale = Math.min(
    window.innerWidth / 1280,
    window.innerHeight / 720,
  );
  stage.style.transform = `scale(${scale})`;
}
