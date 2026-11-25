# Wok Rush

[![make.fun](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![make.fun](https://img.shields.io/badge/make.fun-cooking%20game-orange)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![make.fun](https://img.shields.io/badge/make.fun-best%20cooking%20game-green)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A fast 2D cooking game set in an Indonesian street-food stall. Read the order
tickets, stack ingredients on the plate, and serve before the timer runs out.
Chain serves to build a streak up to x2.5 — serve fast for a PERFECT bonus.

## How to play

- A shift lasts 180 seconds. Orders arrive on tickets, up to 3 at a time.
- Each ticket shows a dish, its recipe, and a 40-second timer.
- Click an ingredient card or press keys **1–0** to add it to the plate
  (max 4 ingredients, no duplicates).
- Press **SPACE** / **ENTER** or click **SERVE!** when the plate matches a
  ticket exactly: score += round(price × streak × (PERFECT ? 1.5 : 1)).
  PERFECT means serving with more than half the ticket timer left.
- **X** / **Backspace** or **CLEAR** empties the plate.
- An expired ticket costs 1 life and resets the streak. Lose all 3 lives or
  run out of shift time and the shift is over.
- The last 30 seconds are **RUSH HOUR**: orders arrive faster.
- **P** pauses, **M** mutes the sounds. All sounds are synthesized WebAudio —
  no audio files, no network, fully offline.

## Recipes

| Dish | Ingredients | Price |
| --- | --- | --- |
| Fried Rice | Rice, Egg, Soy Sauce, Chili | 300 |
| Fried Noodles | Noodles, Chicken, Egg, Veggies | 350 |
| Toasted Bread | Bread, Cheese, Sauce | 250 |
| Spicy Chicken Rice | Rice, Chicken, Chili, Sauce | 400 |
| Chicken Noodles | Noodles, Chicken, Chili, Sauce | 350 |
| Veggie Fried Rice | Rice, Veggies, Egg, Sauce | 300 |
| Spicy Cheese Toast | Bread, Cheese, Chili | 280 |

## Run it

```sh
node serve.ts --port 8080
# open http://localhost:8080/
```

Staged screenshots: `?shot=title|play|serve|end&seed=1`.

## Files

- `game/index.html` — page shell and styles
- `game/src/config.js` — constants and the seeded RNG
- `game/src/recipes.js` — ingredients and recipes
- `game/src/state.js` — orders, plate, score, streak, lives
- `game/src/input.js` — keyboard and mouse controls
- `game/src/render.js` — HUD, tickets, plate, screens
- `game/src/audio.js` — WebAudio sound effects
- `game/src/shots.js` — deterministic staged screenshot states
- `game/src/main.js` — bootstrap and game loop
