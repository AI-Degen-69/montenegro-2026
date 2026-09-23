/* Offline shell for the trip page. Images + app frame work offline.
   Live data (/api/plan, weather, Google Maps links) still needs internet. */
const CACHE = "mne2026-v20";
const SHELL = [
  "./",
  "./index.html",
  "./utils.cjs",
  "./manifest.webmanifest",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/icon-180.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Live data: never cache
  if (
    url.includes("/api/") ||
    url.includes("open-meteo.com") ||
    url.includes("cdnjs.cloudflare.com") ||
    url.includes("fonts.googleapis.com") ||
    url.includes("fonts.gstatic.com")
  ) return;
  if (e.request.method !== "GET") return;

  // Page itself: network first, offline falls back to cache
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Photos + icons: cache first
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      });
    })
  );
});
