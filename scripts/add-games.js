// Pulls the latest version of each game from its own GitHub repo and puts it
// into the built site, under /games/<name>/. Runs after Eleventy on every build.
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import cards from "../src/_data/games.js";
import site from "../src/_data/site.js";

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// The game pages come from their own repos. Add the missing description,
// canonical link and share tags so each one matches the rest of the site.
function stampGamePage(file, card) {
  let html = readFileSync(file, "utf8");
  const url = `${site.url.replace(/\/$/, "")}${card.href}`;
  const desc = escapeAttr(card.text);
  const title = escapeAttr(card.title);
  const bits = [];
  if (!/name=["']description["']/i.test(html)) {
    bits.push(`<meta name="description" content="${desc}">`);
  }
  if (!/rel=["']canonical["']/i.test(html)) {
    bits.push(`<link rel="canonical" href="${url}">`);
  }
  if (!/property=["']og:url["']/i.test(html)) {
    bits.push(`<meta property="og:title" content="${title}">`);
    bits.push(`<meta property="og:description" content="${desc}">`);
    bits.push(`<meta property="og:url" content="${url}">`);
  }
  if (!bits.length || !/<\/head>/i.test(html)) return;
  html = html.replace(/<\/head>/i, `${bits.join("\n")}\n</head>`);
  writeFileSync(file, html);
}

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
  {
    name: "helpdesk-horde",
    repo: "https://github.com/Spookybaron/HelpdeskHorde.git",
    files: ["index.html", "voices.js", "trailer.js"],
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
  const page = join(dest, "index.html");
  const card = cards.find((item) => item.href === `/games/${game.name}/`);
  if (card && existsSync(page)) stampGamePage(page, card);
}

rmSync(tmp, { recursive: true, force: true });
