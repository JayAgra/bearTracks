let version = "1.0.0";
let cachename = `scouting-${version}`

self.addEventListener("install", function (event) {
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
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
