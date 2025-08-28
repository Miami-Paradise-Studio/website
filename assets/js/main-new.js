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

	// Advanced visual effects
	class VisualEffects {
		constructor() {
			this.init();
		}

		init() {
			if (Utils.prefersReducedMotion()) return;

			this.addGlitchEffect();
			this.addScanLines();
			this.addCyberGrid();
			this.addHolographicEffects();
		}

		addGlitchEffect() {
			const glitchElements = document.querySelectorAll('.glitch-text');
			glitchElements.forEach(el => {
				el.setAttribute('data-text', el.textContent);
			});
		}

		addScanLines() {
			const scanLine = document.createElement('div');
			scanLine.className = 'scan-line';
			document.body.appendChild(scanLine);
		}

		addCyberGrid() {
			const hero = document.querySelector('.hero');
			if (hero) {
				const grid = document.createElement('div');
				grid.className = 'cyber-grid';
				hero.appendChild(grid);
			}
		}

		addHolographicEffects() {
			const cards = document.querySelectorAll('.shard-feature, .process-card, .investor-card');
			cards.forEach(card => {
				card.classList.add('holographic-card');
			});
		}
	}

	// Interactive cursor effects
	class CursorEffects {
		constructor() {
			this.cursor = null;
			this.cursorTrail = [];
			this.init();
		}

		init() {
			if (Utils.prefersReducedMotion() || 'ontouchstart' in window) return;

			this.createCursor();
			this.bindEvents();
		}

		createCursor() {
			this.cursor = document.createElement('div');
			this.cursor.className = 'custom-cursor';
			this.cursor.style.cssText = `
				position: fixed;
				width: 20px;
				height: 20px;
				background: radial-gradient(circle, rgba(0,232,255,0.8) 0%, transparent 70%);
				border-radius: 50%;
				pointer-events: none;
				z-index: 9999;
				mix-blend-mode: screen;
				transition: transform 0.1s ease;
			`;
			document.body.appendChild(this.cursor);
		}

		bindEvents() {
			document.addEventListener('mousemove', (e) => {
				if (this.cursor) {
					this.cursor.style.left = e.clientX - 10 + 'px';
					this.cursor.style.top = e.clientY - 10 + 'px';
				}
			});

			// Scale cursor on interactive elements
			const interactiveElements = document.querySelectorAll('a, button, .btn');
			interactiveElements.forEach(el => {
				el.addEventListener('mouseenter', () => {
					if (this.cursor) {
						this.cursor.style.transform = 'scale(2)';
					}
				});

				el.addEventListener('mouseleave', () => {
					if (this.cursor) {
						this.cursor.style.transform = 'scale(1)';
					}
				});
			});
		}
	}

	// Sound effects (optional)
	class SoundEffects {
		constructor() {
			this.audioContext = null;
			this.sounds = {};
			this.init();
		}

		init() {
			// Only initialize if user has interacted with page
			document.addEventListener('click', this.initAudio.bind(this), { once: true });
		}

		initAudio() {
			try {
				this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
				this.createSounds();
				this.bindEvents();
			} catch (e) {
				console.log('Audio not supported');
			}
		}

		createSounds() {
			// Create simple beep sounds for interactions
			this.sounds.hover = this.createBeep(800, 0.1, 0.05);
			this.sounds.click = this.createBeep(600, 0.2, 0.1);
		}

		createBeep(frequency, duration, volume) {
			return () => {
				if (!this.audioContext) return;

				const oscillator = this.audioContext.createOscillator();
				const gainNode = this.audioContext.createGain();

				oscillator.connect(gainNode);
				gainNode.connect(this.audioContext.destination);

				oscillator.frequency.value = frequency;
				oscillator.type = 'sine';

				gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
				gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
				gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

				oscillator.start(this.audioContext.currentTime);
				oscillator.stop(this.audioContext.currentTime + duration);
			};
		}

		bindEvents() {
			// Add subtle sound effects to buttons
			const buttons = document.querySelectorAll('.btn:not(.btn-disabled)');
			buttons.forEach(btn => {
				btn.addEventListener('mouseenter', () => {
					if (this.sounds.hover) this.sounds.hover();
				});

				btn.addEventListener('click', () => {
					if (this.sounds.click) this.sounds.click();
				});
			});
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
		new VisualEffects();
		new CursorEffects();
		new SoundEffects();

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

		// Add floating animation to icons
		const icons = document.querySelectorAll('.feature-icon, .join-icon');
		icons.forEach(icon => {
			icon.classList.add('float-element');
		});

		// Add energy pulse to active elements
		const activeElements = document.querySelectorAll('.in-progress .phase-status i');
		activeElements.forEach(el => {
			el.classList.add('energy-icon');
		});
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();