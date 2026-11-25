// main.ts — hand-in program: copy game/ + screenshots/ to the output dir
// and write dossier.json with buildDossier from vendor/makefun-game.ts.
// Node 22, standard library only. Runs twice and must write identical bytes.
import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const outDir = resolve(
  process.env.MAKEFUN_OUTPUT_DIR || "/output",
);

mkdirSync(outDir, { recursive: true });
rmSync(join(outDir, "game"), { recursive: true, force: true });
rmSync(join(outDir, "screenshots"), { recursive: true, force: true });

cpSync(join(repoRoot, "game"), join(outDir, "game"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), {
  recursive: true,
});

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
console.log(`Wok Rush dossier written to ${join(outDir, "dossier.json")}`);
