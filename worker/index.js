// www.spookybaron.co.uk -> https://spookybaron.co.uk, keeping the path and query.
// Every other host is served from the static assets, with the same headers and 404s as before.

const APEX = "spookybaron.co.uk";
const WWW = "www.spookybaron.co.uk";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === WWW) {
      url.hostname = APEX;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
