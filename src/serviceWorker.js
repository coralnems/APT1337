// Service worker for the 3D Visualization Platform

const CACHE_NAME = '3d-visualization-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.ico',
  '/manifest.json',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - cache-first for static assets, network-first for API calls
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API calls - network first, then cache
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3D models/assets - cache first with network fallback
  if (event.request.url.includes('/models/') || 
      event.request.url.includes('/textures/') || 
      event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request).then((response) => {
            return caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
        })
    );
    return;
  }

  // For everything else - network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache responses that aren't successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
