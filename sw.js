const CACHE_NAME = 'schapenwerk-v4.8';
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
  '/schapenwerk/manifest.json',
  '/schapenwerk/version.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
  
  // Stuur bericht naar alle clients dat er een update is
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'UPDATE_AVAILABLE', version: CACHE_NAME });
      });
    })
  );
});

// Check voor nieuwe versies
self.addEventListener('message', event => {
  if (event.data === 'checkForUpdate') {
    self.skipWaiting();
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'UPDATE_AVAILABLE', version: CACHE_NAME });
      });
    });
  }
});