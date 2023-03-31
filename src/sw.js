var version = '2.2.0'
var cacheName = `scouting-pwa-${version}`
var filesToCache = [
  'appinstall.js',
  'float.min.css',
  'form.min.js',
  'fonts/Raleway-300.ttf',
  'fonts/Raleway-500.ttf',
  'settings',
  'matches',
  'scouts'
];

//Start the service worker and cache all
self.addEventListener("install", (e) => {
    console.log("[W] Install");
    e.waitUntil(
      (async () => {
        const cache = await caches.open(cacheName);
        console.log("[SW] Caching all: app shell and content");
        await cache.addAll(filesToCache);
      })()
    );
  });

console.log('[SW] Executed')

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

/* Serve cached content when on or offline */
self.addEventListener("fetch", (e) => {
    e.respondWith(
      (async () => {
        const r = await caches.match(e.request);
        console.log(`[SW] Fetching resource: ${e.request.url}`);
        if (r) {
          return r;
        }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[SW] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      })()
    );
  });