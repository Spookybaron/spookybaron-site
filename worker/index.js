// www.spookybaron.co.uk -> https://spookybaron.co.uk, keeping the path and query.
// GET /api/youtube reads the public channel feeds. Everything else is a static file.

import { CHANNELS, feedUrl, videosFrom } from "../src/youtube-feed.js";

const APEX = "spookybaron.co.uk";
const WWW = "www.spookybaron.co.uk";
const CACHE_SECONDS = 20 * 60;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function loadChannel(channel) {
  const response = await fetch(feedUrl(channel.channelId), {
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
    headers: {
      "user-agent": BROWSER_UA,
      accept: "application/atom+xml,application/xml,text/xml,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const videos = videosFrom(await response.text());
  if (!videos.length) throw new Error("feed had no videos");
  return videos;
}

export async function youtubePayload() {
  const results = await Promise.all(CHANNELS.map(async (channel) => {
    try {
      return { key: channel.key, ok: true, videos: await loadChannel(channel) };
    } catch {
      return { key: channel.key, ok: false, videos: [] };
    }
  }));
  const channels = {};
  let okCount = 0;
  for (const result of results) {
    channels[result.key] = { ok: result.ok, videos: result.videos };
    if (result.ok) okCount += 1;
  }
  return { okCount, body: { channels } };
}

async function youtubeResponse(request) {
  const cacheKey = new Request(new URL("/api/youtube", request.url), { method: "GET" });
  let cache = null;
  try {
    cache = caches.default;
  } catch {
    cache = null;
  }
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const { okCount, body } = await youtubePayload();
  const response = new Response(JSON.stringify(body), {
    status: okCount ? 200 : 502,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": okCount === CHANNELS.length ? `public, max-age=${CACHE_SECONDS}` : "no-store",
    },
  });
  if (cache && okCount === CHANNELS.length) {
    await cache.put(cacheKey, response.clone());
  }
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === WWW) {
      url.hostname = APEX;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/youtube" && request.method === "GET") {
      return youtubeResponse(request);
    }
    return env.ASSETS.fetch(request);
  },
};
