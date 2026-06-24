const CACHE_NAME = "montys-rezepte-v7";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest?v=2",
  "./assets/styles.css?v=2",
  "./assets/app.js?v=2",
  "./assets/icons/app-icon.svg?v=2",
  "./assets/images/teriyaki-bowl.png?v=2",
  "./recipes/index.js?v=2",
  "./recipes/teriyaki-bowl.js?v=2",
  "./lib/format.js?v=2",
  "./lib/storage.js?v=2",
  "./lib/timeline.js?v=2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", responseClone));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    }).catch(() => caches.match("./index.html"))
  );
});
