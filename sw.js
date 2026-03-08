// Service Worker — network-first strategy
// Always tries to load fresh from network, falls back to cache if offline

const CACHE = 'robot-defense-v1';

self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim()); // take control of all pages immediately
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Store fresh copy in cache
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request)) // offline fallback
  );
});
