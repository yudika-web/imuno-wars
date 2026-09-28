/* IMUNO WARS PWA: cache the app shell; assets are cached as they are loaded. */
const CACHE_NAME = 'imuno-wars-v1.1.5';
const CACHE_PREFIX = 'imuno-wars-';
const BASE = new URL('./', self.location.href);
const CORE = [
  './', './index.html', './manifest.webmanifest', './css/game.css',
  './data/game-data.js', './data/sprite-data.js', './data/sprite-metrics.js',
  './data/audio-data.js', './js/campaign.js', './js/progression.js',
  './js/audio.js', './js/music.js', './js/settings.js', './js/game.js',
  './assets/menu/start-screen.webp', './assets/menu/main-menu.webp',
  './assets/pwa/icon-192.png', './assets/pwa/icon-512.png',
  './assets/pwa/icon-maskable-512.png', './assets/pwa/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(BASE.href) || request.headers.has('range')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
      }
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(request)) || cache.match(new URL('./index.html', BASE));
    }));
    return;
  }

  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const copy = response.clone();
      event.waitUntil(cache.put(request, copy));
    }
    return response;
  }));
});
