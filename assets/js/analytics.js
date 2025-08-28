// Enhanced Analytics and Performance Monitoring
// Miami Paradise Studio - Privacy-focused analytics

(function () {
	'use strict';

	// Privacy-first analytics configuration
	const ANALYTICS_CONFIG = {
		trackingId: 'MPS-2024',
		apiEndpoint: '/api/analytics',
		batchSize: 10,
		flushInterval: 30000, // 30 seconds
		enablePerformanceTracking: true,
		enableErrorTracking: true,
		enableUserInteractionTracking: true,
		respectDoNotTrack: true,
		anonymizeIPs: true,
		cookieConsent: false // No cookies by default
	};

	// Check if user has opted out of tracking
	function shouldTrack() {
		// Respect Do Not Track header
		if (ANALYTICS_CONFIG.respectDoNotTrack && navigator.doNotTrack === '1') {
			return false;
		}

		// Check for local opt-out
		if (localStorage.getItem('analytics-opt-out') === 'true') {
			return false;
		}

		// Check for GDPR compliance (if in EU)
		if (isEUUser() && !hasConsentedToAnalytics()) {
			return false;
		}

		return true;
	}

	// Simple EU detection (not 100% accurate, but privacy-friendly)
	function isEUUser() {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const euTimezones = [
			'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome',
			'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
			'Europe/Prague', 'Europe/Warsaw', 'Europe/Stockholm', 'Europe/Helsinki',
			'Europe/Copenhagen', 'Europe/Oslo', 'Europe/Dublin', 'Europe/Lisbon',
			'Europe/Athens', 'Europe/Budapest', 'Europe/Bucharest', 'Europe/Sofia',
			'Europe/Zagreb', 'Europe/Ljubljana', 'Europe/Bratislava', 'Europe/Tallinn',
			'Europe/Riga', 'Europe/Vilnius', 'Europe/Luxembourg', 'Europe/Malta',
			'Europe/Nicosia'
		];
		return euTimezones.includes(timezone);
	}

	function hasConsentedToAnalytics() {
		return localStorage.getItem('analytics-consent') === 'true';
	}

	// Analytics class
	class PrivacyAnalytics {
		constructor() {
			this.events = [];
			this.sessionId = this.generateSessionId();
			this.userId = this.generateUserId();
			this.startTime = Date.now();
			this.pageLoadTime = null;
			this.performanceMetrics = {};

			if (shouldTrack()) {
				this.init();
			}
		}

		init() {
			this.trackPageView();
			this.setupPerformanceTracking();
			this.setupErrorTracking();
			this.setupUserInteractionTracking();
			this.setupVisibilityTracking();
			this.setupScrollTracking();
			this.startBatchProcessor();
		}

		generateSessionId() {
			return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
		}

		generateUserId() {
			// Generate anonymous user ID (no personal data)
			let userId = localStorage.getItem('anonymous-user-id');
			if (!userId) {
				userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
				localStorage.setItem('anonymous-user-id', userId);
			}
			return userId;
		}

		trackEvent(eventName, properties = {}) {
			if (!shouldTrack()) return;

			const event = {
				id: this.generateEventId(),
				name: eventName,
				properties: {
					...properties,
					timestamp: Date.now(),
					sessionId: this.sessionId,
					userId: this.userId,
					url: window.location.href,
					referrer: document.referrer || 'direct',
					userAgent: this.anonymizeUserAgent(navigator.userAgent),
					viewport: {
						width: window.innerWidth,
						height: window.innerHeight
					},
					screen: {
						width: screen.width,
						height: screen.height,
						colorDepth: screen.colorDepth
					},
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					language: navigator.language,
					platform: navigator.platform
				}
			};

			this.events.push(event);
			console.log('Analytics Event:', eventName, properties);

			// Flush if batch is full
			if (this.events.length >= ANALYTICS_CONFIG.batchSize) {
				this.flush();
			}
		}

		generateEventId() {
			return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
		}

		anonymizeUserAgent(userAgent) {
			// Remove potentially identifying information
			return userAgent
				.replace(/\d+\.\d+\.\d+\.\d+/g, 'x.x.x.x') // Remove version numbers
				.replace(/Chrome\/[\d.]+/g, 'Chrome/xxx')
				.replace(/Firefox\/[\d.]+/g, 'Firefox/xxx')
				.replace(/Safari\/[\d.]+/g, 'Safari/xxx')
				.replace(/Edge\/[\d.]+/g, 'Edge/xxx');
		}

		trackPageView() {
			this.trackEvent('page_view', {
				title: document.title,
				path: window.location.pathname,
				search: window.location.search ? 'has_params' : 'no_params', // Don't track actual params
				hash: window.location.hash ? 'has_hash' : 'no_hash'
			});
		}

		setupPerformanceTracking() {
			if (!ANALYTICS_CONFIG.enablePerformanceTracking) return;

			// Track page load performance
			window.addEventListener('load', () => {
				setTimeout(() => {
					const navigation = performance.getEntriesByType('navigation')[0];
					if (navigation) {
						this.performanceMetrics = {
							loadTime: navigation.loadEventEnd - navigation.loadEventStart,
							domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
							firstByte: navigation.responseStart - navigation.requestStart,
							domInteractive: navigation.domInteractive - navigation.navigationStart,
							domComplete: navigation.domComplete - navigation.navigationStart
						};

						this.trackEvent('performance', this.performanceMetrics);
					}

					// Track paint metrics
					const paintEntries = performance.getEntriesByType('paint');
					paintEntries.forEach(entry => {
						this.trackEvent('paint_timing', {
							name: entry.name,
							startTime: entry.startTime
						});
					});
				}, 1000);
			});

			// Track Core Web Vitals
			this.trackWebVitals();
		}

		trackWebVitals() {
			// Largest Contentful Paint (LCP)
			if ('PerformanceObserver' in window) {
				try {
					const lcpObserver = new PerformanceObserver((list) => {
						const entries = list.getEntries();
						const lastEntry = entries[entries.length - 1];
						this.trackEvent('web_vital_lcp', {
							value: lastEntry.startTime,
							rating: this.getLCPRating(lastEntry.startTime)
						});
					});
					lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

					// First Input Delay (FID)
					const fidObserver = new PerformanceObserver((list) => {
						const entries = list.getEntries();
						entries.forEach(entry => {
							const fid = entry.processingStart - entry.startTime;
							this.trackEvent('web_vital_fid', {
								value: fid,
								rating: this.getFIDRating(fid)
							});
						});
					});
					fidObserver.observe({ entryTypes: ['first-input'] });

					// Cumulative Layout Shift (CLS)
					let clsValue = 0;
					const clsObserver = new PerformanceObserver((list) => {
						const entries = list.getEntries();
						entries.forEach(entry => {
							if (!entry.hadRecentInput) {
								clsValue += entry.value;
							}
						});
					});
					clsObserver.observe({ entryTypes: ['layout-shift'] });

					// Report CLS on page unload
					window.addEventListener('beforeunload', () => {
						this.trackEvent('web_vital_cls', {
							value: clsValue,
							rating: this.getCLSRating(clsValue)
						});
					});

				} catch (e) {
					console.log('Performance Observer not fully supported');
				}
			}
		}

		getLCPRating(value) {
			if (value <= 2500) return 'good';
			if (value <= 4000) return 'needs_improvement';
			return 'poor';
		}

		getFIDRating(value) {
			if (value <= 100) return 'good';
			if (value <= 300) return 'needs_improvement';
			return 'poor';
		}

		getCLSRating(value) {
			if (value <= 0.1) return 'good';
			if (value <= 0.25) return 'needs_improvement';
			return 'poor';
		}

		setupErrorTracking() {
			if (!ANALYTICS_CONFIG.enableErrorTracking) return;

			// JavaScript errors
			window.addEventListener('error', (event) => {
				this.trackEvent('javascript_error', {
					message: event.message,
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno,
					stack: event.error ? event.error.stack : null
				});
			});

			// Unhandled promise rejections
			window.addEventListener('unhandledrejection', (event) => {
				this.trackEvent('unhandled_rejection', {
					reason: event.reason ? event.reason.toString() : 'Unknown',
					stack: event.reason && event.reason.stack ? event.reason.stack : null
				});
			});

			// Resource loading errors
			window.addEventListener('error', (event) => {
				if (event.target !== window) {
					this.trackEvent('resource_error', {
						tagName: event.target.tagName,
						source: event.target.src || event.target.href,
						type: event.target.type || 'unknown'
					});
				}
			}, true);
		}

		setupUserInteractionTracking() {
			if (!ANALYTICS_CONFIG.enableUserInteractionTracking) return;

			// Button clicks
			document.addEventListener('click', (event) => {
				const target = event.target.closest('button, .btn, a[href]');
				if (target) {
					this.trackEvent('click', {
						element: target.tagName.toLowerCase(),
						className: target.className,
						text: target.textContent.trim().substring(0, 100),
						href: target.href || null,
						x: event.clientX,
						y: event.clientY
					});
				}
			});

			// Form submissions
			document.addEventListener('submit', (event) => {
				const form = event.target;
				this.trackEvent('form_submit', {
					formId: form.id || 'unnamed',
					formClass: form.className,
					fieldCount: form.elements.length
				});
			});

			// Video interactions (if any)
			document.addEventListener('play', (event) => {
				if (event.target.tagName === 'VIDEO') {
					this.trackEvent('video_play', {
						src: event.target.src,
						duration: event.target.duration
					});
				}
			});

			document.addEventListener('pause', (event) => {
				if (event.target.tagName === 'VIDEO') {
					this.trackEvent('video_pause', {
						src: event.target.src,
						currentTime: event.target.currentTime
					});
				}
			});
		}

		setupVisibilityTracking() {
			let visibilityStart = Date.now();
			let isVisible = !document.hidden;

			document.addEventListener('visibilitychange', () => {
				const now = Date.now();

				if (document.hidden) {
					// Page became hidden
					if (isVisible) {
						this.trackEvent('page_visibility', {
							action: 'hidden',
							visibleTime: now - visibilityStart
						});
						isVisible = false;
					}
				} else {
					// Page became visible
					if (!isVisible) {
						this.trackEvent('page_visibility', {
							action: 'visible'
						});
						visibilityStart = now;
						isVisible = true;
					}
				}
			});

			// Track session duration on page unload
			window.addEventListener('beforeunload', () => {
				const sessionDuration = Date.now() - this.startTime;
				this.trackEvent('session_end', {
					duration: sessionDuration,
					visibleTime: isVisible ? Date.now() - visibilityStart : 0
				});
				this.flush(); // Send remaining events
			});
		}

		setupScrollTracking() {
			let maxScroll = 0;
			let scrollMilestones = [25, 50, 75, 90, 100];
			let trackedMilestones = new Set();

			const trackScroll = () => {
				const scrollPercent = Math.round(
					(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
				);

				if (scrollPercent > maxScroll) {
					maxScroll = scrollPercent;

					// Track scroll milestones
					scrollMilestones.forEach(milestone => {
						if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
							this.trackEvent('scroll_milestone', {
								milestone: milestone,
								scrollPercent: scrollPercent
							});
							trackedMilestones.add(milestone);
						}
					});
				}
			};

			window.addEventListener('scroll', this.debounce(trackScroll, 250));
		}

		debounce(func, wait) {
			let timeout;
			return function executedFunction(...args) {
				const later = () => {
					clearTimeout(timeout);
					func(...args);
				};
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
			};
		}

		startBatchProcessor() {
			setInterval(() => {
				if (this.events.length > 0) {
					this.flush();
				}
			}, ANALYTICS_CONFIG.flushInterval);
		}

		async flush() {
			if (this.events.length === 0) return;

			const eventsToSend = [...this.events];
			this.events = [];

			try {
				// In a real implementation, you'd send to your analytics endpoint
				console.log('Sending analytics batch:', eventsToSend.length, 'events');

				// Example: send to your analytics API
				// await fetch(ANALYTICS_CONFIG.apiEndpoint, {
				//     method: 'POST',
				//     headers: {
				//         'Content-Type': 'application/json',
				//     },
				//     body: JSON.stringify({
				//         events: eventsToSend,
				//         timestamp: Date.now()
				//     })
				// });

				// For now, just log to console
				eventsToSend.forEach(event => {
					console.log(`[Analytics] ${event.name}:`, event.properties);
				});

			} catch (error) {
				console.error('Failed to send analytics:', error);
				// Re-add events to queue for retry
				this.events.unshift(...eventsToSend);
			}
		}

		// Public methods for manual tracking
		trackCustomEvent(eventName, properties) {
			this.trackEvent(eventName, properties);
		}

		trackConversion(conversionName, value = null) {
			this.trackEvent('conversion', {
				name: conversionName,
				value: value
			});
		}

		trackTiming(category, variable, time) {
			this.trackEvent('timing', {
				category: category,
				variable: variable,
				time: time
			});
		}

		// Opt-out functionality
		optOut() {
			localStorage.setItem('analytics-opt-out', 'true');
			this.events = []; // Clear pending events
			console.log('Analytics tracking disabled');
		}

		optIn() {
			localStorage.removeItem('analytics-opt-out');
			console.log('Analytics tracking enabled');
		}

		// GDPR consent
		setConsent(hasConsent) {
			localStorage.setItem('analytics-consent', hasConsent.toString());
			if (hasConsent && !this.initialized) {
				this.init();
			}
		}
	}

	// Initialize analytics
	window.MiamiAnalytics = new PrivacyAnalytics();

	// Expose public methods
	window.trackEvent = (name, properties) => window.MiamiAnalytics.trackCustomEvent(name, properties);
	window.trackConversion = (name, value) => window.MiamiAnalytics.trackConversion(name, value);
	window.trackTiming = (category, variable, time) => window.MiamiAnalytics.trackTiming(category, variable, time);
	window.analyticsOptOut = () => window.MiamiAnalytics.optOut();
	window.analyticsOptIn = () => window.MiamiAnalytics.optIn();
	window.setAnalyticsConsent = (consent) => window.MiamiAnalytics.setConsent(consent);

})();