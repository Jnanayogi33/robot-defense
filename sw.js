const CACHE = 'robot-defense-v4';
const FILES = ['/', '/index.html'];
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{caches.open(CACHE).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)));
});
