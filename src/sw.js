let version = "1.0.0";
let cachename = `scouting-${version}`

console.log("[SW] File Executed")

self.addEventListener("activate", (event) => {
    console.log("[SW] Activated");
  event.waitUntil(self.registration?.navigationPreload.enable());
});

self.addEventListener("install", function (event) {
    console.log("[SW] Install Event");
    event.waitUntil(
        caches.open(cachename).then(function (cache) {
            return cache.addAll([
                "/form.min.js",
                "/float.min.css",
                "/css/fonts/whatever-v8.woff",
                "/assets/blackjack.js",
                "/assets/spin.css",
                "/assets/deal.png",
                "/assets/hit.png",
                "/assets/stand.png",
                "/assets/wheel.png",
                "/assets/yummy.mp3"
            ]);
        })
     );
});

self.addEventListener("fetch", function (event) {
    console.log("[SW] Fetch Event");
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
