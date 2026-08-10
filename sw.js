// Miami Paradise Studio service worker.
// Bump CACHE_VERSION on every deploy that changes a precached file.
// The 512px icon and the maskable icon are deliberately absent from
// STATIC_ASSETS: they are only read when the install prompt appears, so
// precaching them would cost every first-time visitor 474 kB for nothing.
const CACHE_VERSION = 'v5';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const RUNTIME_CACHE_LIMIT = 50;
const OFFLINE_URL = '/offline';

// Extensionless page URLs on purpose: static hosts (serve, Vercel, Cloudflare
// Pages) answer "/page.html" with a 301 to "/page", and Cache.put rejects a
// redirected response.
const STATIC_ASSETS = [
	'/',
	'/shard-protocol',
	OFFLINE_URL,
	'/assets/css/style-new.css',
	'/assets/js/main-new.js',
	'/assets/js/vendor/tsparticles.bundle.min.js',
	'/assets/icons.svg',
	'/assets/fonts/archivo-latin.woff2',
	'/assets/fonts/martian-mono-latin.woff2',
	'/assets/images/android-chrome-192x192.png',
	'/assets/images/favicon-32x32.png',
	'/assets/images/favicon-16x16.png',
	'/assets/images/apple-touch-icon.png',
	'/site.webmanifest'
];

// addAll is atomic: one unreachable or redirected entry throws away the whole
// precache. Cache each asset on its own so a single miss cannot leave the
// visitor with no offline copy at all.
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then((cache) => Promise.allSettled(
				STATIC_ASSETS.map((url) => cache.add(url).catch((error) => {
					console.warn('Precache skipped', url, error);
					throw error;
				}))
			))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then((names) => Promise.all(
				names
					.filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
					.map((name) => caches.delete(name))
			))
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	if (request.mode === 'navigate') {
		event.respondWith(networkFirst(request));
		return;
	}

	// Assets are served from cache for speed, then refreshed in the background,
	// so a deploy reaches returning visitors on their next navigation.
	event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, response.clone());
			trimCache(RUNTIME_CACHE, RUNTIME_CACHE_LIMIT);
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;

		const offline = await caches.match(OFFLINE_URL);
		if (offline) return offline;

		return new Response('Offline', {
			status: 503,
			headers: { 'Content-Type': 'text/plain' }
		});
	}
}

async function staleWhileRevalidate(request) {
	const cached = await caches.match(request);

	const network = fetch(request).then(async (response) => {
		if (response.ok) {
			const cache = await caches.open(STATIC_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	}).catch(() => cached);

	return cached || network;
}

async function trimCache(cacheName, maxEntries) {
	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	for (let i = 0; i < keys.length - maxEntries; i++) {
		await cache.delete(keys[i]);
	}
}
