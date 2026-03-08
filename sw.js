const CACHE = 'robot-defense-v3';
const FILES = ['/', '/index.html', '/css/style.css',
  '/js/game.js', '/js/particles.js', '/js/audio.js', '/js/draw.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.match(e.request))
  );
});
