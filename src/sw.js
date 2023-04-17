/*jslint browser: true*/
/*jslint es6*/
var version = '4.1.0';
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

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener("activate", (event) => {
  event.waitUntil(enableNavigationPreload());
});

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info("using preload response", preloadResponse);
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  try {
    const responseFromNetwork = await fetch(request);

    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }

    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

self.addEventListener("fetch", (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: "/",
    })
  );
});