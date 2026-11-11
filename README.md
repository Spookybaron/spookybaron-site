# spookybaron-site

My website: a home page, games, a journal, videos, and the other places I post. It's hosted on Cloudflare and rebuilds on its own whenever something is pushed to `main`.

## Writing a journal entry

1. On GitHub, open the `src/journal` folder and click **Add file → Create new file**.
2. Name it with the date first, then a few words, e.g. `2026-11-12-new-level.md`. The date in the name is the date the entry shows.
3. Start the file with a title, then write underneath:

   ```
   ---
   title: Working on a new level
   ---

   Today I added the pub...
   ```

4. Click **Commit changes**. The site updates a minute or so later.

Entries are written in Markdown: `**bold**`, `*italic*`, `[a link](https://example.com)`, and a blank line between paragraphs. Pictures go in `src/journal/images/`, and an entry links one as `/journal/images/your-picture.png`.

## Games

Games live in their own repos. Each time the site builds, `scripts/add-games.js` copies the latest version of each game into `/games/<name>/`. To add a game, add it to the list in that file and add a card in `src/_data/games.js`. That list is what the home page and the games page both show.

The games right now:

- Eddie vs Richie — `/games/eddie-vs-richie/`
- Grok Snake — `/games/grok-snake/`
- Cheeky Pete — `/games/cheeky-pete/`
- Helpdesk Horde — `/games/helpdesk-horde/`

A change to a game repo doesn't rebuild this site by itself. To pick it up, push anything here, or click **Retry deployment** on the latest deploy in Cloudflare.

## Videos and social

The Videos page lists recent uploads from Luke’s Life on Film. The Social page has the YouTube channels, TikTok, Twitch and X. Those video lists are fetched from YouTube’s public feed while the site builds. If YouTube doesn’t answer, the page still builds and shows a link to the channel instead.

## Cloudflare settings

The site is deployed as a Cloudflare Worker that serves static files. `wrangler.jsonc` tells Cloudflare to publish the `_site` folder. The settings in Cloudflare are:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

## Running it on your own computer

You need [Node.js](https://nodejs.org). Then:

```bash
npm install
npm start
```

and open http://localhost:8080. (The games only appear in a full `npm run build`.)
