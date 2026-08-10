// Miami Paradise Studio service worker.
//
// Astro fingerprints every built asset, so there is no stable list of filenames
// to precache. Only the two shells and the offline page are named here; the
// hashed CSS, JS, fonts and images are picked up at runtime instead. That keeps
// this file correct across deploys without a build step generating it.
const CACHE_VERSION = 'v6';
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const RUNTIME_LIMIT = 60;
const OFFLINE_URL = '/offline.html';

const SHELL = ['/', '/shard-protocol', OFFLINE_URL];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(SHELL_CACHE)
			// Individually, not addAll: one redirect or 404 must not throw away the rest.
			.then((cache) =>
				Promise.allSettled(
					SHELL.map((url) =>
						cache.add(url).catch((error) => {
							console.warn('Precache skipped', url, error);
							throw error;
						})
					)
				)
			)
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
						.map((name) => caches.delete(name))
				)
			)
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

	event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, response.clone());
			trim(RUNTIME_CACHE, RUNTIME_LIMIT);
		}
		return response;
	} catch {
		return (
			(await caches.match(request)) ??
			(await caches.match(OFFLINE_URL)) ??
			new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
		);
	}
}

async function staleWhileRevalidate(request) {
	const cached = await caches.match(request);

	const network = fetch(request)
		.then(async (response) => {
			if (response.ok) {
				const cache = await caches.open(RUNTIME_CACHE);
				cache.put(request, response.clone());
				trim(RUNTIME_CACHE, RUNTIME_LIMIT);
			}
			return response;
		})
		.catch(() => cached);

	return cached || network;
}

async function trim(cacheName, maxEntries) {
	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	for (let i = 0; i < keys.length - maxEntries; i++) {
		await cache.delete(keys[i]);
	}
}
