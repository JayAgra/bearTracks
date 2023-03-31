var version = '2.2.2'
var cacheName = `scouting-pwa-${version}`
var filesToCache = [
  '/',
  'appinstall.js',
  'float.min.css',
  'form.min.js',
  'fonts/Raleway-300.ttf',
  'fonts/Raleway-500.ttf',
  'settings',
  'matches',
  'scouts',
  'teams',
  'points'
];

//Start the service worker and cache all
self.addEventListener('install', function(e) {
  e.waitUntil(
      caches.open(cacheName).then(function(cache) {
          return cache.addAll(filesToCache);
      })
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
self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function(e) {
        return caches.open(cacheName).then(function(cache) {
          return cache.match(event.request, {'ignoreSearch': true}).then(response => response);
        });
    }));
});