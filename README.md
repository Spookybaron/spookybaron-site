# spookybaron-site

My website: a home page, a journal, and my games. It's hosted on Cloudflare and rebuilds on its own whenever something is pushed to `main`.

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

Entries are written in Markdown: `**bold**`, `*italic*`, `[a link](https://example.com)`, and a blank line between paragraphs.

## Games

Games live in their own repos. Each time the site builds, `scripts/add-games.js` copies the latest version of each game into `/games/<name>/`. To add a game, add it to the list in that file and give it a card on the home page (`src/index.njk`).

A change to a game repo doesn't rebuild this site by itself. To pick it up, push anything here, or click **Retry deployment** on the latest deploy in Cloudflare.

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
