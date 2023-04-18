console.log("[SW] File Executed");

const urlsToCache = ["/form.min.js","/float.min.css","/css/fonts/whatever-v8.woff","/assets/blackjack.js","/assets/spin.css","/assets/deal.png","/assets/hit.png","/assets/stand.png","/assets/wheel.png","/assets/yummy.mp3"];
self.addEventListener("install", (event) => {
console.log("[SW] Service worker installed");
   event.waitUntil(
        caches.open("pwa-assets").then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Service worker activated");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(url.searchParams.get("name")).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(function (reason) {
          console.error("ServiceWorker fetch failed: ", reason);
        });
      return cachedResponse || networkFetch;
    })
  );
});