//SERVICE WORKER
const cacheName = "sa_v1.1"

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(resources);
};

console.log('sw executed')
self.addEventListener('install', event => {
  event.waitUntil(
    addResourcesToCache([
      "/offline.html",
      "/2023_float.min.css",
      "/form.min.js",
      "/"
    ])
  );
});

console.log('service worker executed')
self.addEventListener('install', function(e) {
    self.skipWaiting()
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(contentToCache);
        })
    );
});

self.addEventListener('activate', event => {
  caches.keys().then(cacheNames => {for (let name of cacheNames) {caches.delete(name);}});

  self.registration.unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => clients.forEach(client => client.navigate(client.url)))
});

/* Serve cache when online */
self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function(e) {
        return caches.open(cacheName).then(function(cache) {
          return cache.match(event.request,
            {'ignoreSearch': true}).then(response => response);
        });
    }));
});