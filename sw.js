const CACHE_NAME = 'schapenwerk-v6.0';
const urlsToCache = [
  '/schapenwerk/',
  '/schapenwerk/index.html',
  '/schapenwerk/werkdag.html',
  '/schapenwerk/werkdagen.html',
  '/schapenwerk/locaties.html',
  '/schapenwerk/stappenteller.html',
  '/schapenwerk/kilometerregistratie.html',
  '/schapenwerk/contacten.html',
  '/schapenwerk/facturen.html',
  '/schapenwerk/factuur-maken.html',
  '/schapenwerk/instellingen.html',
  '/schapenwerk/feedback.html',
  '/schapenwerk/privé-rit.html',
  '/schapenwerk/manifest.json'
];

// Install event - cache alle bestanden
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync voor timers
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sync event:', event.tag);
  if (event.tag === 'sync-timers') {
    event.waitUntil(syncTimers());
  }
});

async function syncTimers() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_TIMERS' });
  });
}

// Periodieke background sync (als ondersteund)
self.addEventListener('periodicsync', event => {
  console.log('[Service Worker] Periodic sync:', event.tag);
  if (event.tag === 'timer-sync') {
    event.waitUntil(syncTimers());
  }
});