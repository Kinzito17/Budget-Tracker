const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "favicon.ico",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
]

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("pre-cache successful");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

//activate
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keylist => {
            return Promise.all(
                keylist.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

//fetch
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondsWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(res => {
                        if (res.status === 200) {
                            cache.put(evt.request.url, res.clone());
                        }
                        return res;
                    })
                    .catch(err => {
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
});