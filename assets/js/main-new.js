'use strict';

(function () {
	// Performance and animation utilities
	const Utils = {
		// Debounce function for performance
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
		},

		// Check if user prefers reduced motion
		prefersReducedMotion() {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		},

		// Smooth scroll with reduced motion support
		smoothScrollTo(target, offset = 80) {
			const element = document.querySelector(target);
			if (!element) return;

			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - offset;

			if (this.prefersReducedMotion()) {
				window.scrollTo(0, offsetPosition);
			} else {
				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth'
				});
			}
		},

		// Intersection Observer for animations
		createObserver(callback, options = {}) {
			const defaultOptions = {
				root: null,
				rootMargin: '0px 0px -10% 0px',
				threshold: 0.1
			};

			return new IntersectionObserver(callback, { ...defaultOptions, ...options });
		}
	};

	// Header scroll behavior
	class HeaderController {
		constructor() {
			this.header = document.querySelector('.site-header');
			this.lastScrollY = window.scrollY;
			this.ticking = false;

			this.init();
		}

		init() {
			if (!this.header) return;

			window.addEventListener('scroll', this.handleScroll.bind(this));
		}

		handleScroll() {
			if (!this.ticking) {
				requestAnimationFrame(this.updateHeader.bind(this));
				this.ticking = true;
			}
		}

		updateHeader() {
			const currentScrollY = window.scrollY;

			if (currentScrollY > 100) {
				this.header.style.background = 'rgba(6, 2, 10, 0.98)';
				this.header.style.backdropFilter = 'blur(20px)';
			} else {
				this.header.style.background = 'rgba(6, 2, 10, 0.95)';
				this.header.style.backdropFilter = 'blur(10px)';
			}

			this.lastScrollY = currentScrollY;
			this.ticking = false;
		}
	}

	// Navigation functionality
	class Navigation {
		constructor() {
			this.mobileToggle = document.querySelector('.mobile-toggle');
			this.navMenu = document.querySelector('.nav-menu');
			this.navLinks = document.querySelectorAll('.nav-link');

			this.init();
		}

		init() {
			// Mobile menu toggle
			if (this.mobileToggle) {
				this.mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
			}

			// Smooth scroll for nav links
			this.navLinks.forEach(link => {
				if (link.getAttribute('href').startsWith('#')) {
					link.addEventListener('click', this.handleNavClick.bind(this));
				}
			});

			// Close mobile menu on outside click
			document.addEventListener('click', (e) => {
				if (!e.target.closest('.nav-container')) {
					this.closeMobileMenu();
				}
			});
		}

		toggleMobileMenu() {
			const isExpanded = this.mobileToggle.getAttribute('aria-expanded') === 'true';
			this.mobileToggle.setAttribute('aria-expanded', !isExpanded);

			if (this.navMenu) {
				this.navMenu.classList.toggle('mobile-open');
			}
		}

		closeMobileMenu() {
			this.mobileToggle.setAttribute('aria-expanded', 'false');
			if (this.navMenu) {
				this.navMenu.classList.remove('mobile-open');
			}
		}

		handleNavClick(e) {
			e.preventDefault();
			const target = e.target.getAttribute('href');
			Utils.smoothScrollTo(target);
			this.closeMobileMenu();
		}
	}

	// Particles configuration
	class ParticlesController {
		constructor() {
			this.container = document.getElementById('tsparticles');
			this.init();
		}

		init() {
			if (!this.container || !window.tsParticles) return;

			const config = {
				background: {
					color: {
						value: "transparent",
					},
				},
				fpsLimit: 60,
				interactivity: {
					events: {
						onClick: {
							enable: false,
						},
						onHover: {
							enable: !Utils.prefersReducedMotion(),
							mode: "repulse",
						},
						resize: true,
					},
					modes: {
						repulse: {
							distance: 100,
							duration: 0.4,
						},
					},
				},
				particles: {
					color: {
						value: ["#00E8FF", "#FC109C", "#A52AFF"],
					},
					links: {
						color: "#00E8FF",
						distance: 150,
						enable: true,
						opacity: 0.2,
						width: 1,
					},
					collisions: {
						enable: false,
					},
					move: {
						direction: "none",
						enable: true,
						outModes: {
							default: "bounce",
						},
						random: false,
						speed: Utils.prefersReducedMotion() ? 0.5 : 1,
						straight: false,
					},
					number: {
						density: {
							enable: true,
							area: 800,
						},
						value: Utils.prefersReducedMotion() ? 30 : 50,
					},
					opacity: {
						value: 0.3,
					},
					shape: {
						type: "circle",
					},
					size: {
						value: { min: 1, max: 3 },
					},
				},
				detectRetina: true,
			};

			tsParticles.load("tsparticles", config);
		}
	}

	// Scroll animations
	class ScrollAnimations {
		constructor() {
			this.animatedElements = document.querySelectorAll('[data-animate]');
			this.init();
		}

		init() {
			if (Utils.prefersReducedMotion()) return;

			const observer = Utils.createObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add('animate-in');
					}
				});
			});

			this.animatedElements.forEach(el => {
				observer.observe(el);
			});
		}
	}

	// SHARD Protocol preview interactions
	class ShardPreview {
		constructor() {
			this.preview = document.querySelector('.shard-preview');
			this.voiceIndicator = document.querySelector('.voice-indicator');
			this.objectiveMarker = document.querySelector('.objective-marker');

			this.commands = ['SHIELD', 'LOCAL', 'AIRSTRIKE', 'OVERDRIVE', 'SHOCKWAVE'];
			this.objectives = ['FLAG CAPTURED', 'ENEMY SPOTTED', 'BASE BREACH', 'MISSION COMPLETE'];

			this.init();
		}

		init() {
			if (!this.preview || Utils.prefersReducedMotion()) return;

			// Cycle through voice commands
			setInterval(() => {
				this.updateVoiceCommand();
			}, 3000);

			// Cycle through objectives
			setInterval(() => {
				this.updateObjective();
			}, 4500);
		}

		updateVoiceCommand() {
			if (!this.voiceIndicator) return;

			const randomCommand = this.commands[Math.floor(Math.random() * this.commands.length)];
			this.voiceIndicator.textContent = randomCommand;

			// Add pulse animation
			this.voiceIndicator.style.animation = 'none';
			requestAnimationFrame(() => {
				this.voiceIndicator.style.animation = 'pulse 2s infinite';
			});
		}

		updateObjective() {
			if (!this.objectiveMarker) return;

			const randomObjective = this.objectives[Math.floor(Math.random() * this.objectives.length)];
			this.objectiveMarker.textContent = randomObjective;
		}
	}

	// Performance monitoring
	class PerformanceMonitor {
		constructor() {
			this.init();
		}

		init() {
			// Monitor Core Web Vitals
			if ('web-vital' in window) {
				this.measureWebVitals();
			}

			// Monitor frame rate
			this.monitorFrameRate();
		}

		measureWebVitals() {
			// This would integrate with web-vitals library if available
			// For now, we'll use basic performance API
			window.addEventListener('load', () => {
				const navigation = performance.getEntriesByType('navigation')[0];
				if (navigation) {
					console.log('LCP:', navigation.loadEventEnd - navigation.loadEventStart);
				}
			});
		}

		monitorFrameRate() {
			let frames = 0;
			let lastTime = performance.now();

			const countFrames = (currentTime) => {
				frames++;
				if (currentTime >= lastTime + 1000) {
					const fps = Math.round((frames * 1000) / (currentTime - lastTime));
					if (fps < 30) {
						console.warn('Low FPS detected:', fps);
					}
					frames = 0;
					lastTime = currentTime;
				}
				requestAnimationFrame(countFrames);
			};

			requestAnimationFrame(countFrames);
		}
	}

	// Form handling (if needed for newsletter/contact)
	class FormHandler {
		constructor() {
			this.forms = document.querySelectorAll('form');
			this.init();
		}

		init() {
			this.forms.forEach(form => {
				form.addEventListener('submit', this.handleSubmit.bind(this));
			});
		}

		async handleSubmit(e) {
			e.preventDefault();
			const form = e.target;
			const formData = new FormData(form);

			// Add loading state
			const submitBtn = form.querySelector('button[type="submit"]');
			const originalText = submitBtn.textContent;
			submitBtn.textContent = 'Sending...';
			submitBtn.disabled = true;

			try {
				// This would integrate with your backend
				await this.submitForm(formData);
				this.showSuccess(form);
			} catch (error) {
				this.showError(form, error.message);
			} finally {
				submitBtn.textContent = originalText;
				submitBtn.disabled = false;
			}
		}

		async submitForm(formData) {
			// Placeholder for actual form submission
			return new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
		}

		showSuccess(form) {
			const message = document.createElement('div');
			message.className = 'form-success';
			message.textContent = 'Success! We\'ll be in touch.';
			form.appendChild(message);

			setTimeout(() => {
				message.remove();
			}, 5000);
		}

		showError(form, errorMessage) {
			const message = document.createElement('div');
			message.className = 'form-error';
			message.textContent = errorMessage || 'Something went wrong. Please try again.';
			form.appendChild(message);

			setTimeout(() => {
				message.remove();
			}, 5000);
		}
	}

	// Initialize everything when DOM is ready
	function init() {
		// Set current year in footer
		const yearElement = document.getElementById('current-year');
		if (yearElement) {
			yearElement.textContent = new Date().getFullYear();
		}

		// Initialize all controllers
		new HeaderController();
		new Navigation();
		new ParticlesController();
		new ScrollAnimations();
		new ShardPreview();
		new PerformanceMonitor();
		new FormHandler();

		// Add data-animate attributes to elements that should animate
		const elementsToAnimate = [
			'.hero-content',
			'.shard-feature',
			'.process-card',
			'.roadmap-phase',
			'.investor-card',
			'.join-card'
		];

		elementsToAnimate.forEach(selector => {
			document.querySelectorAll(selector).forEach(el => {
				el.setAttribute('data-animate', 'true');
			});
		});
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();