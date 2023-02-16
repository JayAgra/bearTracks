//SERVICE WORKER

console.log("SW Installed");
const cacheName = "scouting-app-v1";
const contentToCache = [
    '/2023_float.css',
    '/2023_float.min.css',
    '/fonts/Raleway-500.ttf',
    '/fonts/Raleway-300.ttf',
    '/offline.html'
];


console.log('sw executed')
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(contentToCache);
        })
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