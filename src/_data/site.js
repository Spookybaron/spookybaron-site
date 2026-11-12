// A public site token, not a secret. Leave this empty until it is created
// in the Cloudflare dashboard, or set CF_BEACON_TOKEN when the site is built.
// GOOGLE_SITE_VERIFICATION is optional; the DNS check is the simpler route.
function publicId(value) {
  const text = String(value || "").trim();
  return /^[A-Za-z0-9_-]{10,100}$/.test(text) ? text : "";
}

export default {
  url: "https://spookybaron.co.uk",
  beaconToken: publicId(process.env.CF_BEACON_TOKEN),
  googleSiteVerification: publicId(process.env.GOOGLE_SITE_VERIFICATION),
  description: "Luke (Spookybaron), a UK creator. Games, videos, and a journal.",
  nav: [
    { href: "/games/", label: "Games" },
    { href: "/journal/", label: "Journal" },
    { href: "/videos/", label: "Videos" },
    { href: "/social/", label: "Social" },
  ],
};
