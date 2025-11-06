const CACHE_NAME = 'travel-checklist-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// Install: precache without activating automatically
self.addEventListener('install', (event) => {
  console.log('SW: New version installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // DO NOT skipWaiting() automatically - wait for user decision
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: New version activated');
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : undefined)))
    )
  );
  self.clients.claim();
});

// Fetch: Network First for HTML, Stale-While-Revalidate for the rest
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // Network First for HTML documents (to see changes immediately)
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith((async () => {
      try {
        console.log('SW: Fetching HTML from network:', request.url);
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
      } catch (error) {
        console.log('SW: Network failed, trying cache:', error);
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })());
    return;
  }

  // Stale-While-Revalidate for the rest (CSS, JS, images, etc.)
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkPromise = (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        return undefined;
      }
    })();

    if (cached) {
      event.waitUntil(networkPromise);
      return cached;
    }

    const fromNetwork = await networkPromise;
    return fromNetwork || new Response('Offline', { status: 503, statusText: 'Offline' });
  })());
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
