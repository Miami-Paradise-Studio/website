const CACHE_NAME = 'mps-website-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/images/android-chrome-192x192.png',
  '/assets/images/favicon-32x32.png',
  '/assets/images/favicon-16x16.png',
  '/site.webmanifest'
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Outfit:wght@400;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // For external assets, try cache first then network
        if (EXTERNAL_ASSETS.some(asset => event.request.url.includes(asset.split('?')[0]))) {
          return fetch(event.request)
            .then(response => {
              // Only cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseClone))
                  .catch(error => console.error('Failed to cache external asset:', error));
              }
              return response;
            })
            .catch(error => {
              console.warn('External asset failed to load:', event.request.url, error);
              // Return empty response for failed external assets
              return new Response('', { status: 204 });
            });
        }

        // For API requests, always try network first
        if (event.request.url.includes('/api/')) {
          return fetch(event.request)
            .catch(error => {
              console.warn('API request failed:', event.request.url, error);
              // Return mock response for demo purposes
              if (event.request.url.includes('/api/subscribe')) {
                return new Response(
                  JSON.stringify({ 
                    success: true, 
                    message: 'Demo mode: Thank you for your interest!' 
                  }),
                  { 
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              }
              throw error;
            });
        }

        // For other requests, try network then cache
        return fetch(event.request)
          .then(response => {
            // Cache successful responses for static assets
            if (response.status === 200 && event.request.url.startsWith(location.origin)) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone))
                .catch(error => console.error('Failed to cache asset:', error));
            }
            return response;
          })
          .catch(error => {
            console.warn('Network request failed:', event.request.url, error);
            throw error;
          });
      })
  );
});

// Background sync for offline form submissions (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'subscribe-sync') {
    event.waitUntil(
      // Handle offline form submissions when connection is restored
      handleOfflineSubmissions()
    );
  }
});

async function handleOfflineSubmissions() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const offlineSubmissions = await cache.match('offline-submissions');
    
    if (offlineSubmissions) {
      const submissions = await offlineSubmissions.json();
      
      for (const submission of submissions) {
        try {
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission)
          });
        } catch (error) {
          console.error('Failed to sync offline submission:', error);
        }
      }
      
      // Clear offline submissions after sync
      await cache.delete('offline-submissions');
    }
  } catch (error) {
    console.error('Failed to handle offline submissions:', error);
  }
}