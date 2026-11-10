// Pulls the latest version of each game from its own GitHub repo and puts it
// into the built site, under /games/<name>/. Runs after Eleventy on every build.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const games = [
  {
    name: "eddie-vs-richie",
    repo: "https://github.com/Spookybaron/EddieRichieGame.git",
    files: ["index.html", "css", "js", "music"],
  },
  {
    name: "grok-snake",
    repo: "https://github.com/Spookybaron/GrokSnakeGame.git",
    files: ["index.html", "style.css", "game.js"],
  },
  {
    name: "cheeky-pete",
    repo: "https://github.com/Spookybaron/CheekyPete.git",
    files: ["index.html", "style.css", "game.js", "assets"],
  },
];

const tmp = ".games-tmp";
rmSync(tmp, { recursive: true, force: true });

for (const game of games) {
  const src = join(tmp, game.name);
  const dest = join("_site", "games", game.name);
  console.log(`Fetching ${game.name}…`);
  execSync(`git clone --depth 1 ${game.repo} ${src}`, { stdio: "inherit" });
  mkdirSync(dest, { recursive: true });
  for (const f of game.files) {
    if (existsSync(join(src, f))) cpSync(join(src, f), join(dest, f), { recursive: true });
  }
}

rmSync(tmp, { recursive: true, force: true });
