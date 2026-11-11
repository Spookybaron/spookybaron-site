// Cards for the home page and the games page. Each card shows a faded
// screenshot of its game, kept in src/img/games/. The files themselves are copied
// in at build time by scripts/add-games.js, which has the repo for each game.
export default [
  {
    href: "/games/eddie-vs-richie/",
    image: "/img/games/eddie-vs-richie.webp",
    title: "Eddie vs Richie",
    text: "A scrap in the flat. Bats, kettles, a cricket ball. Works on a phone too.",
  },
  {
    href: "/games/grok-snake/",
    image: "/img/games/grok-snake.webp",
    title: "Grok Snake",
    text: "A neon arcade snake. Steer with the arrows or a swipe, and don’t bite your tail.",
  },
  {
    href: "/games/cheeky-pete/",
    image: "/img/games/cheeky-pete.webp",
    title: "Cheeky Pete",
    text: "Letters drop in time. Hit the matching key as each one lands, while Pete cheers you on.",
  },
  {
    href: "/games/helpdesk-horde/",
    image: "/img/games/helpdesk-horde.webp",
    title: "Helpdesk Horde",
    text: "A crowd of problems heads your way. Send replies, pick up a skill, and last until home time.",
  },
];
