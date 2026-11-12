// Shared shape for the two public YouTube channels. Used by the build and by
// the Worker route, so both lists stay the same.

export const CHANNELS = [
  {
    key: "spooky",
    handle: "Spookybaron",
    name: "Spooky Baron",
    url: "https://www.youtube.com/@Spookybaron",
    channelId: "UC1uinYx_VdlOCFbMgVwxohw",
  },
  {
    key: "life",
    handle: "LukesLifeOnFilm",
    name: "Luke’s Life on Film",
    url: "https://www.youtube.com/@LukesLifeOnFilm",
    channelId: "UCfTNKc-Ni1_n8UxUC9e6JiA",
  },
];

export const LIMIT = 12;

export function feedUrl(channelId) {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

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

export function cleanVideo(video) {
  if (!video || !/^[A-Za-z0-9_-]{11}$/.test(video.id || "")) return null;
  const title = typeof video.title === "string" ? video.title.trim() : "";
  if (!title) return null;
  const watch = `https://www.youtube.com/watch?v=${video.id}`;
  const url =
    typeof video.url === "string" && video.url.startsWith("https://www.youtube.com/")
      ? video.url
      : watch;
  const short = url.includes("/shorts/");
  return {
    id: video.id,
    title,
    published: typeof video.published === "string" ? video.published : "",
    url,
    short,
    thumb: `https://i.ytimg.com/vi/${video.id}/${short ? "oardefault" : "hqdefault"}.jpg`,
  };
}

export function videosFrom(xml) {
  const videos = [];
  for (const chunk of String(xml || "").split("<entry>").slice(1)) {
    const id = chunk.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/)?.[1];
    if (!id) continue;
    const title = decode(chunk.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
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
    const video = cleanVideo({ id, title, published, url });
    if (video) videos.push(video);
    if (videos.length >= LIMIT) break;
  }
  return videos;
}
