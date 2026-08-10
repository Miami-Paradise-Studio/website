'use strict';

(function () {
	const Utils = {
		debounce(func, wait) {
			let timeout;
			return function executedFunction(...args) {
				clearTimeout(timeout);
				timeout = setTimeout(() => func(...args), wait);
			};
		},

		prefersReducedMotion() {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		},

		smoothScrollTo(selector, offset = 80) {
			// '#' alone is not a valid selector and throws in querySelector.
			if (!selector || selector === '#') return;

			const element = document.querySelector(selector);
			if (!element) return;

			const offsetPosition = element.getBoundingClientRect().top + window.scrollY - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: this.prefersReducedMotion() ? 'auto' : 'smooth'
			});
		},

		createObserver(callback, options = {}) {
			return new IntersectionObserver(callback, {
				root: null,
				rootMargin: '0px 0px -10% 0px',
				threshold: 0.1,
				...options
			});
		}
	};

	// Header gets a compact style once the page is scrolled.
	class HeaderController {
		constructor() {
			this.header = document.querySelector('.site-header');
			this.ticking = false;
			this.scrolled = false;

			if (!this.header) return;
			window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
			this.updateHeader();
		}

		handleScroll() {
			if (this.ticking) return;
			requestAnimationFrame(this.updateHeader.bind(this));
			this.ticking = true;
		}

		updateHeader() {
			const scrolled = window.scrollY > 100;
			if (scrolled !== this.scrolled) {
				this.scrolled = scrolled;
				this.header.classList.toggle('is-scrolled', scrolled);
			}
			this.ticking = false;
		}
	}

	class Navigation {
		constructor() {
			this.mobileToggle = document.querySelector('.mobile-toggle');
			this.navMenu = document.querySelector('.nav-menu');

			if (this.mobileToggle) {
				this.mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
			}

			document.querySelectorAll('.nav-link[href^="#"], .nav-link[href^="/#"]').forEach(link => {
				link.addEventListener('click', this.handleNavClick.bind(this));
			});

			document.addEventListener('click', (e) => {
				if (!e.target.closest('.nav-container')) this.closeMobileMenu();
			});

			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape') this.closeMobileMenu();
			});
		}

		toggleMobileMenu() {
			const isExpanded = this.mobileToggle.getAttribute('aria-expanded') === 'true';
			this.mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
			if (this.navMenu) this.navMenu.classList.toggle('mobile-open', !isExpanded);
		}

		closeMobileMenu() {
			if (!this.mobileToggle) return;
			this.mobileToggle.setAttribute('aria-expanded', 'false');
			if (this.navMenu) this.navMenu.classList.remove('mobile-open');
		}

		handleNavClick(e) {
			// currentTarget, not target: the click can land on a child node of the link.
			const href = e.currentTarget.getAttribute('href');
			const hash = href.slice(href.indexOf('#'));

			// Cross-page links (/#about) must still navigate when we are not on the home page.
			if (href.startsWith('/#') && window.location.pathname !== '/') return;

			if (!document.querySelector(hash)) return;

			e.preventDefault();
			Utils.smoothScrollTo(hash);
			this.closeMobileMenu();
		}
	}

	class ParticlesController {
		constructor() {
			const container = document.getElementById('tsparticles');
			if (!container || !window.tsParticles) return;

			const reduced = Utils.prefersReducedMotion();

			tsParticles.load('tsparticles', {
				background: { color: { value: 'transparent' } },
				fpsLimit: 60,
				interactivity: {
					events: {
						onClick: { enable: false },
						onHover: { enable: !reduced, mode: 'repulse' },
						resize: true
					},
					modes: { repulse: { distance: 100, duration: 0.4 } }
				},
				particles: {
					// Sodium amber, rose and storm violet: the ground palette, not the old cyan.
					color: { value: ['#FFC46B', '#FF4D9D', '#9B6BFF'] },
					links: { color: '#FFC46B', distance: 150, enable: true, opacity: 0.12, width: 1 },
					collisions: { enable: false },
					move: {
						direction: 'none',
						enable: true,
						outModes: { default: 'bounce' },
						random: false,
						speed: reduced ? 0.5 : 1,
						straight: false
					},
					number: { density: { enable: true, area: 800 }, value: reduced ? 30 : 50 },
					opacity: { value: 0.3 },
					shape: { type: 'circle' },
					size: { value: { min: 1, max: 3 } }
				},
				detectRetina: true
			});
		}
	}

	// Fallback reveal for engines without scroll-driven animation. Where
	// `animation-timeline: view()` works, the stylesheet owns this entirely and
	// no observer is created.
	class ScrollAnimations {
		constructor() {
			if (CSS.supports('animation-timeline: view()')) return;

			const elements = document.querySelectorAll('[data-animate]');

			if (Utils.prefersReducedMotion()) {
				elements.forEach(el => el.classList.add('animate-in'));
				return;
			}

			const observer = Utils.createObserver((entries) => {
				entries.forEach(entry => {
					if (!entry.isIntersecting) return;
					entry.target.classList.add('animate-in');
					observer.unobserve(entry.target);
				});
			});

			elements.forEach(el => observer.observe(el));
		}
	}

	class VisualEffects {
		constructor() {
			if (Utils.prefersReducedMotion()) return;

			const scanLine = document.createElement('div');
			scanLine.className = 'scan-line';
			scanLine.setAttribute('aria-hidden', 'true');
			document.body.appendChild(scanLine);

			const hero = document.querySelector('.hero');
			if (hero) {
				const grid = document.createElement('div');
				grid.className = 'cyber-grid';
				grid.setAttribute('aria-hidden', 'true');
				hero.appendChild(grid);
			}

			document.querySelectorAll('.shard-feature, .process-card, .investor-card')
				.forEach(card => card.classList.add('holographic-card'));
		}
	}

	// Logs errors for debugging. It deliberately does not interrupt the visitor:
	// a third-party script failing is not something they can act on.
	class ErrorHandler {
		constructor() {
			window.addEventListener('error', (event) => {
				console.error('JavaScript error:', event.error || event.message);
			});

			window.addEventListener('unhandledrejection', (event) => {
				console.error('Unhandled promise rejection:', event.reason);
			});
		}
	}

	class PageLoader {
		constructor() {
			this.loader = document.getElementById('page-loader');
			if (!this.loader) return;

			window.addEventListener('load', () => setTimeout(() => this.hide(), 300));
			// Fallback so a stalled resource can never leave the page hidden.
			setTimeout(() => this.hide(), 3000);
		}

		hide() {
			if (!this.loader) return;
			this.loader.classList.add('hidden');
			setTimeout(() => {
				this.loader.style.display = 'none';
			}, 500);
		}
	}

	class AccessibilityManager {
		constructor() {
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Tab') document.body.classList.add('keyboard-navigation');
			});

			document.addEventListener('mousedown', () => {
				document.body.classList.remove('keyboard-navigation');
			});

			const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			const apply = (e) => document.body.classList.toggle('reduced-motion', e.matches);
			mediaQuery.addEventListener('change', apply);
			apply(mediaQuery);
		}
	}

	// Decorative sparks and metal fragments for the SHARD section.
	// Only runs while the section is on screen and the tab is visible.
	class MGSEffects {
		constructor() {
			this.section = document.querySelector('.mgs-section');
			if (!this.section || Utils.prefersReducedMotion()) return;

			this.sparksContainer = this.section.querySelector('.mgs-sparks');
			this.fireContainer = this.section.querySelector('.mgs-fire-particles');
			this.timers = [];

			const observer = new IntersectionObserver(([entry]) => {
				if (entry.isIntersecting) this.start();
				else this.stop();
			}, { threshold: 0 });

			observer.observe(this.section);
		}

		start() {
			if (this.timers.length) return;
			this.timers = [
				setInterval(() => this.emit(this.sparksContainer, 'mgs-random-spark', 2000), 800),
				setInterval(() => this.emit(this.fireContainer, 'metal-fragment', 4000), 1200)
			];
		}

		stop() {
			this.timers.forEach(clearInterval);
			this.timers = [];
		}

		emit(container, className, lifetimeMs) {
			if (!container || document.hidden) return;

			const node = document.createElement('div');
			node.className = className;
			node.style.left = `${Math.random() * 100}%`;
			node.style.top = `${Math.random() * 100}%`;
			container.appendChild(node);

			setTimeout(() => node.remove(), lifetimeMs);
		}
	}

	async function registerServiceWorker() {
		if (!('serviceWorker' in navigator)) return;

		try {
			await navigator.serviceWorker.register('/sw.js');
		} catch (error) {
			console.error('Service worker registration failed:', error);
		}
	}

	function init() {
		const yearElement = document.getElementById('current-year');
		if (yearElement) yearElement.textContent = new Date().getFullYear();

		// Tag animation targets before ScrollAnimations queries them.
		const animatedSelectors = [
			'.hero-content',
			'.shard-feature',
			'.process-card',
			'.roadmap-phase',
			'.investor-card',
			'.join-card'
		];
		document.querySelectorAll(animatedSelectors.join(', '))
			.forEach(el => el.setAttribute('data-animate', 'true'));

		document.querySelectorAll('.feature-icon, .join-icon')
			.forEach(icon => icon.classList.add('float-element'));

		new ErrorHandler();
		new PageLoader();
		new AccessibilityManager();
		new HeaderController();
		new Navigation();
		new ParticlesController();
		new ScrollAnimations();
		new VisualEffects();
		new MGSEffects();

		registerServiceWorker();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
