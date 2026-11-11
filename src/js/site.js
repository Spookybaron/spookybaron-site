// Click-to-play YouTube (the iframe is created only after a click) and the
// Twitch player, whose parent= host has to match the site that embeds it.
(function () {
  var videoId = /^[A-Za-z0-9_-]{11}$/;

  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    img.addEventListener("error", function () {
      var next = img.getAttribute("data-fallback");
      img.removeAttribute("data-fallback");
      if (next) img.src = next;
    });
  });

  var playlistId = /^[A-Za-z0-9_-]{13,40}$/;

  document.querySelectorAll(".yt-play").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.getAttribute("data-id") || "";
      var playlist = button.getAttribute("data-playlist") || "";
      var src = "";
      if (videoId.test(id)) {
        src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      } else if (playlistId.test(playlist)) {
        src = "https://www.youtube-nocookie.com/embed/videoseries?list=" + playlist + "&rel=0";
      }
      if (!src) return;
      var label = button.getAttribute("aria-label") || "YouTube video";
      var iframe = document.createElement("iframe");
      iframe.className = "yt-frame";
      iframe.src = src;
      iframe.title = label.replace(/^Play\s+/, "") || "YouTube video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      button.replaceWith(iframe);
    });
  });

  function mountTwitch(slot) {
    if (slot.dataset.ready) return;
    var channel = slot.getAttribute("data-channel") || "";
    if (!/^[A-Za-z0-9_]+$/.test(channel)) return;
    slot.dataset.ready = "1";
    var hosts = [
      location.hostname,
      "spookybaron-site.lukebaron.workers.dev",
      "localhost",
      "127.0.0.1",
    ];
    var seen = Object.create(null);
    var parts = ["channel=" + encodeURIComponent(channel)];
    hosts.forEach(function (host) {
      if (!host || seen[host]) return;
      seen[host] = true;
      parts.push("parent=" + encodeURIComponent(host));
    });
    var iframe = document.createElement("iframe");
    iframe.className = "twitch-frame";
    iframe.src = "https://player.twitch.tv/?" + parts.join("&");
    iframe.title = "Twitch player for " + channel + ". Shows the live stream, or the offline screen.";
    iframe.allowFullscreen = true;
    iframe.allow = "autoplay; fullscreen";
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    slot.appendChild(iframe);
    var waiting = slot.querySelector(".twitch-waiting");
    if (waiting) waiting.remove();
  }

  document.querySelectorAll(".twitch-slot").forEach(function (slot) {
    if (!("IntersectionObserver" in window)) {
      mountTwitch(slot);
      return;
    }
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        mountTwitch(slot);
        watcher.disconnect();
      });
    }, { rootMargin: "240px" });
    watcher.observe(slot);
  });
})();
