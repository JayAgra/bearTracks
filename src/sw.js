/*jslint browser: true*/
/*jslint es6*/
var version = '4.0.1';
var cacheName = `scouting-pwa-${version}`;
var filesToCache = [
    '',
    'appinstall.js',
    'float.min.css',
    'form.min.js',
    'fonts/Raleway-300.ttf',
    'fonts/Raleway-500.ttf',
    'settings',
    'matches',
    'scouts',
    'teams',
    'points',
    'main'
];

console.log("[SW] Executed");
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache);
    })
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
self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function (e) {
      return caches.open(cacheName).then(function (cache) {
        return cache
          .match(event.request, { ignoreSearch: true })
          .then((response) => response);
      });
    })
  );
});