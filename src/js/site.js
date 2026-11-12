// Click-to-play YouTube, a live refresh of the video lists, and the Twitch player.
// Twitch parent= is the hostname of the page that is open.
(function () {
  var videoId = /^[A-Za-z0-9_-]{11}$/;
  var playlistId = /^[A-Za-z0-9_-]{13,40}$/;
  var current = null;

  function canAutoplay() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var save = navigator.connection && navigator.connection.saveData;
    return !reduce && !save;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function niceDate(iso) {
    if (!iso) return "";
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function thumb(video) {
    return video.thumb || ("https://i.ytimg.com/vi/" + video.id + "/" + (video.short ? "oardefault" : "hqdefault") + ".jpg");
  }

  function playButton(video) {
    var fallback = video.short
      ? ' data-fallback="https://i.ytimg.com/vi/' + esc(video.id) + '/hqdefault.jpg"'
      : "";
    return '<button type="button" class="yt-play" data-id="' + esc(video.id) + '" aria-label="Play ' + esc(video.title) + '">' +
      '<img src="' + esc(thumb(video)) + '" alt="" width="480" height="360" decoding="async"' + fallback + ">" +
      '<span class="play-icon" aria-hidden="true"></span></button>';
  }

  function mountFrame(button, mute) {
    var id = button.getAttribute("data-id") || "";
    var playlist = button.getAttribute("data-playlist") || "";
    var src = "";
    if (videoId.test(id)) {
      src = "https://www.youtube-nocookie.com/embed/" + id +
        "?autoplay=1&playsinline=1&rel=0&enablejsapi=1" + (mute ? "&mute=1" : "");
    } else if (playlistId.test(playlist)) {
      src = "https://www.youtube-nocookie.com/embed/videoseries?list=" + playlist + "&rel=0";
    }
    if (!src) return null;
    var label = button.getAttribute("aria-label") || "YouTube video";
    var iframe = document.createElement("iframe");
    iframe.className = "yt-frame";
    iframe.src = src;
    iframe.title = label.replace(/^Play\s+/, "") || "YouTube video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    button.hidden = true;
    button.after(iframe);
    return iframe;
  }

  function hideFrame(slide) {
    var frame = slide.querySelector("iframe.yt-frame");
    if (frame) frame.remove();
    var button = slide.querySelector(".yt-play");
    if (button) button.hidden = false;
    var sound = slide.querySelector(".yt-sound");
    if (sound) sound.hidden = true;
    if (current === slide) current = null;
  }

  function showFrame(slide, mute) {
    if (current && current !== slide) hideFrame(current);
    current = slide;
    if (slide.querySelector("iframe.yt-frame")) return;
    var button = slide.querySelector(".yt-play");
    if (!button) return;
    mountFrame(button, mute);
    var sound = slide.querySelector(".yt-sound");
    if (sound) {
      sound.hidden = false;
      sound.textContent = mute ? "Unmute" : "Mute";
      sound.setAttribute("aria-pressed", mute ? "false" : "true");
    }
  }

  function command(iframe, func, args) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func: func,
      args: args || "",
    }), "https://www.youtube-nocookie.com");
  }

  function bindFeed(feed) {
    if (!canAutoplay() || feed._ytObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          showFrame(entry.target, true);
        } else if (entry.intersectionRatio < 0.35) {
          hideFrame(entry.target);
        }
      });
    }, { root: feed, threshold: [0, 0.35, 0.7, 1] });
    feed._ytObserver = observer;
    feed.querySelectorAll(".yt-slide").forEach(function (slide) {
      observer.observe(slide);
    });
  }

  function watchFeeds(scope) {
    (scope || document).querySelectorAll(".yt-feed").forEach(bindFeed);
  }

  document.addEventListener("click", function (event) {
    var sound = event.target.closest && event.target.closest(".yt-sound");
    if (sound) {
      event.preventDefault();
      var slide = sound.closest(".yt-slide");
      var iframe = slide && slide.querySelector("iframe.yt-frame");
      if (!iframe) return;
      var muted = sound.textContent === "Unmute";
      command(iframe, muted ? "unMute" : "mute");
      if (muted) command(iframe, "setVolume", [100]);
      sound.textContent = muted ? "Mute" : "Unmute";
      sound.setAttribute("aria-pressed", muted ? "true" : "false");
      return;
    }
    var button = event.target.closest && event.target.closest(".yt-play");
    if (!button || button.hidden) return;
    var slide = button.closest(".yt-slide");
    if (slide) {
      showFrame(slide, false);
      return;
    }
    if (button.parentNode && button.parentNode.querySelector("iframe.yt-frame")) return;
    mountFrame(button, false);
  });

  document.addEventListener("error", function (event) {
    var img = event.target;
    if (!img || !img.getAttribute || !img.getAttribute("data-fallback")) return;
    var next = img.getAttribute("data-fallback");
    img.removeAttribute("data-fallback");
    img.src = next;
  }, true);

  function slideHtml(video) {
    var date = niceDate(video.published);
    return '<article class="yt-slide" data-id="' + esc(video.id) + '">' +
      '<div class="yt-media' + (video.short ? " is-short" : "") + '">' +
      playButton(video) +
      '<button type="button" class="yt-sound" hidden>Unmute</button></div>' +
      '<div class="yt-caption"><h3><a href="' + esc(video.url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(video.title) + "</a></h3>" +
      (date ? '<time datetime="' + esc(video.published) + '">' + esc(date) + "</time>" : "") +
      "</div></article>";
  }

  function cardHtml(video, featured) {
    var date = niceDate(video.published);
    var heading = featured ? "h2" : "h3";
    return '<article class="vcard' + (featured ? " featured-card" : "") + '" data-id="' + esc(video.id) + '">' +
      '<div class="yt-media' + (video.short ? " is-short" : "") + '">' + playButton(video) + "</div>" +
      "<" + heading + '><a href="' + esc(video.url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(video.title) + "</a></" + heading + ">" +
      (date ? '<time datetime="' + esc(video.published) + '">' + esc(date) + "</time>" : "") +
      "</article>";
  }

  function renderedIds(root) {
    return Array.prototype.map.call(root.querySelectorAll(".yt-slide, .vcard"), function (el) {
      return el.getAttribute("data-id") || "";
    }).join("|");
  }

  function paint(root, videos) {
    var mode = root.getAttribute("data-youtube-mode");
    var count = Number(root.getAttribute("data-youtube-count")) || videos.length;
    var list = videos.slice(0, count);
    if (!list.length) return;
    if (renderedIds(root) === list.map(function (video) { return video.id; }).join("|")) return;
    var height = root.offsetHeight;
    if (height) root.style.minHeight = height + "px";
    if (mode === "feed") {
      if (root._ytObserver) {
        root._ytObserver.disconnect();
        root._ytObserver = null;
      }
      if (current && root.contains(current)) hideFrame(current);
      root.innerHTML = list.map(slideHtml).join("");
      bindFeed(root);
    } else {
      var featured = list[0];
      var rest = list.slice(1);
      var html = '<section class="featured" aria-label="Latest video">' + cardHtml(featured, true) + "</section>";
      if (rest.length) {
        html += '<section aria-labelledby="more-videos"><h2 id="more-videos" class="section-title">More recent uploads</h2><ul class="video-grid">';
        rest.forEach(function (video) {
          html += "<li>" + cardHtml(video, false) + "</li>";
        });
        html += "</ul></section>";
      }
      root.innerHTML = html;
    }
    window.setTimeout(function () { root.style.minHeight = ""; }, 400);
  }

  function refresh() {
    var slots = document.querySelectorAll("[data-youtube-live]");
    if (!slots.length) return;
    fetch("/api/youtube", { headers: { accept: "application/json" } })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (data) {
        if (!data || !data.channels) return;
        slots.forEach(function (slot) {
          var channel = data.channels[slot.getAttribute("data-youtube-live")];
          if (!channel || !channel.ok || !channel.videos || !channel.videos.length) return;
          paint(slot, channel.videos);
        });
      })
      .catch(function () {});
  }

  watchFeeds(document);
  refresh();

  function mountTwitch(slot) {
    if (slot.dataset.ready) return;
    var channel = slot.getAttribute("data-channel") || "";
    if (!/^[A-Za-z0-9_]+$/.test(channel)) return;
    var host = location.hostname;
    if (!host || !/^[A-Za-z0-9.-]+$/.test(host)) return;
    slot.dataset.ready = "1";
    var iframe = document.createElement("iframe");
    iframe.className = "twitch-frame";
    iframe.src = "https://player.twitch.tv/?channel=" + encodeURIComponent(channel) + "&parent=" + encodeURIComponent(host);
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
