/*jslint browser: true*/
/*jslint es6*/
var version = '4.0.4';
var cacheName = `scouting-pwa-${version}`;
var filesToCache = [
    '/',
    '/float.min.css',
    '/form.min.js',
    '/fonts/Raleway-300.ttf',
    '/fonts/Raleway-500.ttf',
    '/settings',
    '/matches',
    '/scouts',
    '/teams',
    '/points',
    '/main'
];

console.log("[SW] Executed");
const addResourcesToCache = async (resources) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache(filesToCache)
  );
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* Serve cached content when offline */
const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  return fetch(request);
};

self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));
});