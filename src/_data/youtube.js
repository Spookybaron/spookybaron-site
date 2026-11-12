// Recent uploads for the two public YouTube channels.
// Channel ids are fixed, so the build only requests the public RSS feed.
// A saved copy in youtube-cache.json is used when the live feed does not answer,
// and that file is rewritten whenever a live fetch works.
// Set YOUTUBE_FETCH=fail to skip the network and use the saved list.
// The pages also refresh from /api/youtube after they load.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHANNELS as FEEDS, LIMIT, feedUrl, videosFrom, cleanVideo } from "../youtube-feed.js";

const BLURBS = {
  spooky: "Gaming, retro, VR, and the cartoons.",
  life: "Everyday filming: days out, the house, and whatever has just been made.",
};

const CHANNELS = FEEDS.map((channel) => ({ ...channel, blurb: BLURBS[channel.key] || "" }));

const ATTEMPTS = 3;
const TIMEOUT_MS = 10000;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const cachePath = join(dirname(fileURLToPath(import.meta.url)), "youtube-cache.json");

function readCache() {
  try {
    const data = JSON.parse(readFileSync(cachePath, "utf8"));
    return data && typeof data === "object" ? data : { channels: {} };
  } catch {
    return { channels: {} };
  }
}

function savedVideos(cache, key) {
  const list = cache.channels?.[key];
  if (!Array.isArray(list)) return [];
  return list.map(cleanVideo).filter(Boolean).slice(0, LIMIT);
}

function writeCache(cache) {
  const stored = {
    fetchedAt: new Date().toISOString(),
    channels: {},
  };
  for (const [key, list] of Object.entries(cache.channels || {})) {
    stored.channels[key] = (Array.isArray(list) ? list : [])
      .map(cleanVideo)
      .filter(Boolean)
      .slice(0, LIMIT)
      .map(({ id, title, published, url }) => ({ id, title, published, url }));
  }
  writeFileSync(cachePath, `${JSON.stringify(stored, null, 2)}\n`);
}

async function fetchText(url) {
  if (process.env.YOUTUBE_FETCH === "fail") {
    throw new Error("live fetch skipped");
  }
  let lastError = new Error("fetch failed");
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
          "user-agent": BROWSER_UA,
          accept: "application/atom+xml,application/xml,text/xml,*/*;q=0.8",
          "accept-language": "en-GB,en;q=0.9",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!text.includes("<feed") && !text.includes("<entry>")) {
        throw new Error("response was not a video feed");
      }
      return text;
    } catch (error) {
      lastError = error;
      const reason = error.name === "TimeoutError" ? `timed out after ${TIMEOUT_MS}ms` : error.message;
      console.warn(`YouTube feed attempt ${attempt}/${ATTEMPTS} failed (${reason})`);
      if (attempt < ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  throw lastError;
}

function withUploads(channel, videos, fromCache) {
  return {
    ...channel,
    ok: videos.length > 0,
    fromCache,
    videos,
    uploads: `UU${channel.channelId.slice(2)}`,
  };
}

async function loadChannel(channel, cache) {
  try {
    const xml = await fetchText(feedUrl(channel.channelId));
    const videos = videosFrom(xml);
    if (!videos.length) throw new Error("feed had no videos");
    console.log(`YouTube @${channel.handle}: ${videos.length} videos from the live feed`);
    return { channel: withUploads(channel, videos, false), videos };
  } catch (error) {
    const saved = savedVideos(cache, channel.key);
    if (saved.length) {
      console.warn(
        `YouTube @${channel.handle} live feed failed (${error.message}). Using ${saved.length} saved videos.`,
      );
      return { channel: withUploads(channel, saved, true), videos: null };
    }
    console.warn(
      `YouTube @${channel.handle} live feed failed (${error.message}) and no saved list exists.`,
    );
    return { channel: withUploads(channel, [], false), videos: null };
  }
}

export default async function () {
  const cache = readCache();
  const loaded = await Promise.all(CHANNELS.map((channel) => loadChannel(channel, cache)));
  const channels = {};
  let refresh = false;
  for (const item of loaded) {
    channels[item.channel.key] = item.channel;
    if (item.videos) {
      cache.channels = cache.channels || {};
      cache.channels[item.channel.key] = item.videos;
      refresh = true;
    }
  }
  if (refresh) writeCache(cache);
  return { channels };
};
