// Recent uploads for the two public YouTube channels.
// The channel id is read from the channel page, then the public RSS feed is
// fetched. If either step fails, the build still succeeds and the page shows
// a link to the channel instead of a video grid.

const CHANNELS = [
  {
    key: "spooky",
    handle: "Spookybaron",
    name: "Spooky Baron",
    url: "https://www.youtube.com/@Spookybaron",
    blurb: "Gaming, retro, VR, and the cartoons.",
  },
  {
    key: "life",
    handle: "LukesLifeOnFilm",
    name: "Luke’s Life on Film",
    url: "https://www.youtube.com/@LukesLifeOnFilm",
    blurb: "Everyday filming: days out, the house, and whatever has just been made.",
  },
];

const LIMIT = 12;
const UA = "Mozilla/5.0 (compatible; SpookybaronSite/1.0; +https://spookybaron-site.lukebaron.workers.dev)";

function decode(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
    headers: {
      "user-agent": UA,
      "accept-language": "en-GB,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

function channelIdFrom(html) {
  const patterns = [
    /"externalId":"(UC[\w-]{22})"/,
    /"browseId":"(UC[\w-]{22})"/,
    /youtube\.com\/channel\/(UC[\w-]{22})/,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function videosFrom(xml) {
  const videos = [];
  for (const chunk of xml.split("<entry>").slice(1)) {
    const id = chunk.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/)?.[1];
    if (!id) continue;
    const title = decode(chunk.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    if (!title) continue;
    const published = chunk.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
    const href =
      chunk.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/)?.[1] ||
      `https://www.youtube.com/watch?v=${id}`;
    let url = `https://www.youtube.com/watch?v=${id}`;
    try {
      const parsed = new URL(href);
      if (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") {
        url = parsed.toString();
      }
    } catch {
      // keep the watch URL
    }
    videos.push({
      id,
      title,
      published,
      url,
      short: url.includes("/shorts/"),
      thumb: `https://i.ytimg.com/vi/${id}/${url.includes("/shorts/") ? "oardefault" : "hqdefault"}.jpg`,
    });
    if (videos.length >= LIMIT) break;
  }
  return videos;
}

async function loadChannel(channel) {
  try {
    const html = await fetchText(channel.url);
    const channelId = channelIdFrom(html);
    if (!channelId) throw new Error("channel id not found on the channel page");
    const rss = await fetchText(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    );
    const videos = videosFrom(rss);
    if (!videos.length) throw new Error("feed had no videos");
    console.log(`YouTube @${channel.handle}: ${videos.length} videos`);
    return { ...channel, ok: true, channelId, videos };
  } catch (error) {
    console.warn(`YouTube @${channel.handle} unavailable (${error.message}). Linking the channel only.`);
    return { ...channel, ok: false, channelId: null, videos: [] };
  }
}

export default async function () {
  const loaded = await Promise.all(CHANNELS.map(loadChannel));
  const channels = {};
  for (const channel of loaded) channels[channel.key] = channel;
  return { channels };
};
