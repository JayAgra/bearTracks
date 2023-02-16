//SERVICE WORKER
const cacheName = "sa_v1"

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(resources);
};

console.log('sw executed')
self.addEventListener('install', event => {
  event.waitUntil(
    addResourcesToCache([
      "/offline.html",
      "/2023_float.css"
    ])
  );
});

console.log('service worker executed')
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(contentToCache);
        })
    );
});

self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
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