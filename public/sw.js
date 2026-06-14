/**
 * Service worker for Habit Tracker.
 *
 * Uses a cache-first strategy for all app assets so the app loads
 * instantly and works fully offline after the first visit. The cache
 * version string is updated on each deploy so stale assets are
 * replaced automatically when a new version is available.
 *
 * Strategy:
 *   1. On install, pre-cache all known app shell assets.
 *   2. On fetch, serve from cache first; fall back to network.
 *   3. On activate, delete any caches from previous versions.
 */

const CACHE_VERSION = 'habit-tracker-v1';

const PRECACHE_ASSETS = [
  '/habit-tracker/',
  '/habit-tracker/index.html',
  '/habit-tracker/manifest.json',
  '/habit-tracker/apple-touch-icon.png',
  '/habit-tracker/icon-192.png',
  '/habit-tracker/icon-512.png',
];

/**
 * Install event — pre-caches the app shell.
 *
 * skipWaiting() ensures the new service worker activates immediately
 * rather than waiting for all existing tabs to close.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

/**
 * Activate event — cleans up caches from previous versions.
 *
 * Any cache whose key doesn't match CACHE_VERSION is deleted.
 * clientsClaim() makes this worker take control of all open pages
 * immediately without requiring a reload.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/**
 * Fetch event — cache-first with network fallback.
 *
 * For navigation requests (page loads), always serves index.html from
 * cache so the app shell loads even without a network connection.
 * For other requests, serves from cache if available, otherwise fetches
 * from network and caches the response for next time.
 */
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Only cache successful same-origin responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});
