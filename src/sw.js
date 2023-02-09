//SERVICE WORKER

self.addEventListener("install", (e) => {
    console.log("SW - Installed");
    const cacheName = "scouting-app-v1";
    const contentToCache = [
        '/2023_float.css',
        '/2023_float.min.css',
        '/fonts/Raleway-500.ttf',
        '/fonts/Raleway-300.ttf'
    ];
    e.waitUntil(
        (async () => {
          const cache = await caches.open(cacheName);
          console.log("SW - caching");
          await cache.addAll(contentToCache);
        })()
      );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
  );
});