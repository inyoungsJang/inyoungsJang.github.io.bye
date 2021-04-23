'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "2ad1c8048a6e6dff6493b1c26a27f9c9",
"index.html": "67d33af9910775e2e9e7a611c64f1671",
"/": "67d33af9910775e2e9e7a611c64f1671",
"main.dart.js": "82beceb136c67c752acbce3df92d85d6",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "a000fa7269d9dbe6a7ede60d372841a8",
"assets/images/topimages.jpg": "381314b47278f826766cc5cf0ff2cf7b",
"assets/images/business_info/business_info1_ho.png": "243841dd92533eb6721bd50408f9d4de",
"assets/images/business_info/business_info1.png": "d39879f7f832472767bff3fc07a40044",
"assets/images/main_background3.jpeg": "f37d45759acaf4f73e87c2145b69bbe5",
"assets/images/contactus_background.png": "d87dfd3d14ecb0c0d1ad7bc560f9213d",
"assets/images/dubhe_icon.png": "9558ff395c54cd188ba1d5aebd1e8f33",
"assets/images/main_background2.jpg": "f469d22e12710803fd927da3e0f76414",
"assets/images/info/dobhe_1.png": "62e87b155e937ffddaf50aa119605ecd",
"assets/images/info/dobhe_3.png": "2e97252193ef82a3f0a1dbcca265b731",
"assets/images/info/dobhe_2.png": "d87ebed716d18e45da952bd80fc73fb3",
"assets/images/info/dobhe_4.png": "d073737d71bb70fb958fa6c7d9d86368",
"assets/images/main_background1.jpg": "da871e257d6f37697f9b4756660a8b7c",
"assets/images/contactus_background2.jpeg": "ab21930de166f9b8c8774b9769bcf794",
"assets/images/portfolio/portfolio_4.png": "7d7ac38cd52b948edacde9f592251553",
"assets/images/portfolio/portfolio_5.png": "8eb6f8b4ac002bd098f7e32e6fc1c3b7",
"assets/images/portfolio/portfolio_7.png": "160b0e41d9f4b06d01cbe9cb75f24d1c",
"assets/images/portfolio/portfolio_6.png": "61da6dc5a7dcda51f790096d26c35d49",
"assets/images/portfolio/portfolio_2.png": "0adf6973c1adecbefb6c86e6ab7f5f9a",
"assets/images/portfolio/portfolio_3.png": "fb0934686059845425055270c32f1c07",
"assets/images/portfolio/portfolio_1.png": "cbb4807d240935bd56948c574c508a97",
"assets/images/portfolio/portfolio_8.png": "039096330c948b02a27f7724f795e04c",
"assets/images/business_info1.png": "243841dd92533eb6721bd50408f9d4de",
"assets/AssetManifest.json": "93111467123f3caa6491574e06f6b6ef",
"assets/NOTICES": "879caec4a31a9afb594007918503d191",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
