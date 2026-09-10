const CACHE_NAME = "educafe-dsutra-v4";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./config.js",
  "./manifest.json",
  "./assets/library-welcome.webp",
  "./assets/library-48.png",
  "./assets/library-180.png",
  "./assets/library-192.png",
  "./assets/library-512.png",
  "./assets/library-maskable-512.png",
  "./assets/fonts/inter-latin.woff2",
  "./assets/fonts/poppins-600.woff2",
  "./assets/fonts/poppins-700.woff2",
  "./assets/fonts/poppins-800.woff2",
  "./assets/vendor/lucide-0.468.0.min.js",
  "./assets/vendor/chart-4.4.7.min.js",
  "./assets/vendor/jspdf-2.5.2.min.js",
  "./assets/vendor/jspdf-autotable-3.8.4.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("educafe-dsutra-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok) {
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request).then(async (cached) => cached ||
        (request.mode === "navigate" ? await caches.match("./index.html") : null) || Response.error()))
  );
});
