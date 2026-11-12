// Themed shelves on the Videos page. Unlike the "Latest" list, which only ever
// holds the newest 12 uploads from YouTube's feed, these stay put until you
// take them out, so older favourites don't vanish.
//
// To add a video: copy its id from the YouTube link (the 11 characters after
// /shorts/ or ?v=), add a line to the right shelf, and push. `note` is optional
// and shows under the title. To start a new shelf, copy one of the blocks.

import { cleanVideo } from "../youtube-feed.js";

const shelves = [
  {
    slug: "animated",
    title: "Animated comedy",
    blurb: "The cartoons from Spooky Baron. Gas meters, Grandad, and things going wrong.",
    videos: [
      { id: "dnioi5b_mmM", title: "The Gas Man Cometh! The Meter Reads 000000", channel: "spooky" },
      { id: "xzF2IYkMlMw", title: "Grandad's on the Case!", channel: "spooky", short: true },
      { id: "be_M2qfWvoo", title: "Grandad's Mistake", channel: "spooky", short: true },
    ],
  },
  {
    slug: "gaming",
    title: "Gaming, WoW and retro",
    blurb: "Azeroth, old consoles, and the odd rage moment.",
    videos: [
      { id: "u-gUEqY7-Y0", title: "WoW Forever Lore | Elwynn Forest", channel: "spooky", short: true },
      { id: "1Y_Q7WQ5x_M", title: "Just One More Quest", channel: "spooky", short: true },
      { id: "dOfBmbFTMFg", title: "Would You Visit the Mines Alone?", channel: "spooky", short: true },
      { id: "_XWDv_zoh_w", title: "Retro Gaming Rage and Glitches", channel: "spooky", short: true },
    ],
  },
  {
    slug: "days-out",
    title: "Days out and the drone",
    blurb: "Blackpool, the sea front from the air, and caravan trips.",
    videos: [
      { id: "jT5LDwSVoNo", title: "Neo on the Sea Front! A quick fly for the sunset!", channel: "life" },
      { id: "3Yt9LSBEscw", title: "Nice little day with the munchkin and a nice toy haul!", channel: "life", short: true },
      { id: "eJRw97xur1I", title: "Bispham Beach in Blackpool!", channel: "life", short: true },
      { id: "1hepmHEhhIs", title: "What the hell did that seagull just throw at me?", channel: "life", short: true },
      { id: "AQ2fYbpjcV8", title: "Quick scoot around the site at Wild Rose Caravan Park in Appleby", channel: "life" },
      { id: "YFUSeffjODY", title: "Tea Time at Wild Rose Park Appleby", channel: "life", short: true },
    ],
  },
  {
    slug: "made",
    title: "Made at home",
    blurb: "3D prints, and the garden cinema built for the World Cup.",
    videos: [
      { id: "cv-ZdBcDYNg", title: "Quick print! Retro Console stand", channel: "life", short: true },
      { id: "vUaU70yav4k", title: "3D Print Guess Who", channel: "life", short: true },
      { id: "tY38RsbLlfY", title: "Screen for the Garden! World Cup in the evening!", channel: "life", short: true },
      { id: "9KrFaNxGH5A", title: "Quick test of the screen! With my projector!", channel: "life", short: true },
      { id: "lVPw0ey_hU4", title: "Now we need some decent football!", channel: "life", short: true },
      { id: "0JkX7zRpUqQ", title: "Glorious summer in the garden", channel: "life" },
    ],
  },
];

export default shelves.map((shelf) => ({
  ...shelf,
  videos: shelf.videos
    .map((video) => {
      const url = video.short
        ? `https://www.youtube.com/shorts/${video.id}`
        : `https://www.youtube.com/watch?v=${video.id}`;
      const clean = cleanVideo({ id: video.id, title: video.title, url });
      return clean && { ...clean, note: video.note || "", channel: video.channel || "" };
    })
    .filter(Boolean),
}));
