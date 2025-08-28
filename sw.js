// Miami Paradise Studio PWA
// Version 1.0.0

const CACHE_NAME = 'miami-paradise-studio-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Static assets to cache immediately
const STATIC_ASSETS = [
	'/',
	'/index.html',
	'/assets/css/style-new.css',
	'/assets/js/main-new.js',
	'/assets/images/android-chrome-192x192.png',
	'/assets/images/favicon-32x32.png',
	'/assets/images/favicon-16x16.png',
	'/site.webmanifest'
]

// External resources to cache dynamically
const DYNAMIC_ASSETS = [
	'https://fonts.googleapis.com/css2',
	'https://fonts.gstatic.com/s/',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/',
	'https://cdn.jsdelivr.net/npm/tsparticles@2.12.0/'
]

// Install and cache static assets
self.addEventListener('install', (event) => {
	console.log('PWA installing')

	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then((cache) => {
				console.log('Caching static assets')
				return cache.addAll(STATIC_ASSETS)
			})
			.then(() => {
				console.log('Static assets cached')
				return self.skipWaiting()
			})
			.catch((error) => {
				console.error('Cache error', error)
			})
	)
})

// Activate and clean old caches
self.addEventListener('activate', (event) => {
	console.log('PWA activating')

	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
							console.log('Deleting old cache', cacheName)
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				console.log('PWA activated')
				return self.clients.claim()
			})
	)
})

// Handle fetch requests with caching strategies
self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)

	if (request.method !== 'GET') return
	if (!request.url.startsWith('http')) return

	if (STATIC_ASSETS.includes(url.pathname)) {
		event.respondWith(cacheFirst(request))
	} else if (isDynamicAsset(request.url)) {
		event.respondWith(staleWhileRevalidate(request))
	} else if (request.destination === 'document') {
		event.respondWith(networkFirst(request))
	} else {
		event.respondWith(networkFirst(request))
	}
})

// Cache first strategy for static assets
async function cacheFirst(request) {
	try {
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			return cachedResponse
		}

		const networkResponse = await fetch(request)
		if (networkResponse.ok) {
			const cache = await caches.open(STATIC_CACHE)
			cache.put(request, networkResponse.clone())
		}
		return networkResponse
	} catch (error) {
		console.error('Cache first failed', error)
		return new Response('Offline', { status: 503 })
	}
}

// Network first strategy for dynamic content
async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request)
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE)
			cache.put(request, networkResponse.clone())
		}
		return networkResponse
	} catch (error) {
		console.log('Network failed, trying cache', request.url)
		const cachedResponse = await caches.match(request)
		if (cachedResponse) {
			return cachedResponse
		}

		if (request.destination === 'document') {
			return caches.match('/')
		}

		return new Response('Offline', { status: 503 })
	}
}

// Stale while revalidate for external resources
async function staleWhileRevalidate(request) {
	const cache = await caches.open(DYNAMIC_CACHE)
	const cachedResponse = await cache.match(request)

	const fetchPromise = fetch(request).then((networkResponse) => {
		if (networkResponse.ok) {
			cache.put(request, networkResponse.clone())
		}
		return networkResponse
	}).catch(() => cachedResponse)

	return cachedResponse || fetchPromise
}

// Check if URL is a dynamic asset
function isDynamicAsset(url) {
	return DYNAMIC_ASSETS.some(asset => url.includes(asset))
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
	if (event.tag === 'form-submission') {
		event.waitUntil(syncFormSubmissions())
	}
})

async function syncFormSubmissions() {
	const submissions = await getStoredSubmissions()

	for (const submission of submissions) {
		try {
			await fetch('/api/investor-access', {
				method: 'POST',
				body: submission.data
			})

			await removeStoredSubmission(submission.id)
		} catch (error) {
			console.error('Failed to sync form submission', error)
		}
	}
}

async function getStoredSubmissions() {
	return []
}

async function removeStoredSubmission(submissionId) {
	console.log('Removing stored submission', submissionId)
}

// Push notifications for future use
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json()
		const options = {
			body: data.body,
			icon: '/assets/images/android-chrome-192x192.png',
			badge: '/assets/images/favicon-32x32.png',
			vibrate: [100, 50, 100],
			data: {
				dateOfArrival: Date.now(),
				primaryKey: data.primaryKey
			},
			actions: [
				{
					action: 'explore',
					title: 'View Details',
					icon: '/assets/images/favicon-16x16.png'
				},
				{
					action: 'close',
					title: 'Close',
					icon: '/assets/images/favicon-16x16.png'
				}
			]
		}

		event.waitUntil(
			self.registration.showNotification(data.title, options)
		)
	}
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close()

	if (event.action === 'explore') {
		event.waitUntil(
			clients.openWindow('/')
		)
	}
})

// Error handling
self.addEventListener('error', (event) => {
	console.error('Service Worker error', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
	console.error('Service Worker unhandled rejection', event.reason)
})