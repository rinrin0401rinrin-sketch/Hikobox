const CACHE_VERSION = "hiko-pwa-v12";
const APP_CACHE = `${CACHE_VERSION}-app`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const PHOTO_CACHE = `${CACHE_VERSION}-photos`;
const APP_BASE = new URL("./", self.location.href);
const BASE_PATH = APP_BASE.pathname;

const APP_SHELL_PATHS = [
  "",
  "index.html",
  "offline.html",
  "styles.css",
  "src/main.js",
  "src/member-store.js",
  "src/member-schema.js",
  "src/pwa.js",
  "data/members/index.json",
  "data/members/search-index.json",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];
const APP_SHELL = APP_SHELL_PATHS.map((path) => new URL(path || "./", APP_BASE).toString());
const OFFLINE_URL = new URL("offline.html", APP_BASE).toString();

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => ![APP_CACHE, DATA_CACHE, PHOTO_CACHE].includes(key))
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, APP_CACHE, OFFLINE_URL));
    return;
  }

  const relativePath = getRelativePath(url.pathname);

  if (relativePath?.startsWith("data/photos/")) {
    event.respondWith(cacheFirst(request, PHOTO_CACHE));
    return;
  }

  if (relativePath?.startsWith("data/members/")) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  if (relativePath !== null && APP_SHELL_PATHS.includes(relativePath)) {
    event.respondWith(networkFirst(request, APP_CACHE, OFFLINE_URL));
  }
});

function getRelativePath(pathname) {
  if (!pathname.startsWith(BASE_PATH)) {
    return null;
  }

  return pathname.slice(BASE_PATH.length);
}

async function networkFirst(request, cacheName, fallbackPath) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    return cache.match(fallbackPath);
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}
