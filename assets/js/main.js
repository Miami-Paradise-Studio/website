'use strict';

// Wrap all code in an IIFE to avoid polluting the global scope
(function() {

    const FormFeedback = {
        // Handles form error display and success messages
        SUCCESS_MESSAGE_TIMEOUT: 2800,

        displayError(message, inputEl, errorEl) {
            // Show validation error
            if (!errorEl || !inputEl) return;
            errorEl.textContent = message;
            errorEl.classList.add('visible');
            inputEl.classList.add('error');
            inputEl.setAttribute('aria-invalid', 'true');
            if (errorEl.id) {
                inputEl.setAttribute('aria-describedby', errorEl.id);
            }
        },

        clearError(inputEl, errorEl) {
            // Clear previous error
            if (!errorEl || !inputEl) return;
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
            inputEl.classList.remove('error');
            inputEl.removeAttribute('aria-invalid');
            inputEl.removeAttribute('aria-describedby');
        },

        showSuccessMessage(responseEl) {
            // Display confirmation message briefly
            if (!responseEl) return;
            let timeoutId = responseEl.dataset.timeoutId ? parseInt(responseEl.dataset.timeoutId, 10) : null;
            if (timeoutId) clearTimeout(timeoutId);

            // Set default success message if not already set
            if (!responseEl.textContent.trim()) {
                responseEl.textContent = '🎉 Thank you! You\'ll receive insider updates soon.';
            }

            responseEl.classList.add('visible');
            timeoutId = setTimeout(() => {
                responseEl.classList.remove('visible');
                responseEl.textContent = '';
                delete responseEl.dataset.timeoutId;
            }, this.SUCCESS_MESSAGE_TIMEOUT);
            responseEl.dataset.timeoutId = timeoutId;
        }
    };

    function isEmailCorrectFormat(email) {
        // Validate email format with enhanced security
        if (!email || typeof email !== 'string') return false;

        // Check for basic XSS attempts
        if (email.includes('<') || email.includes('>') || email.includes('"') || email.includes('\'')) {
            return false;
        }

        // Standard email validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
    }

    function sanitizeInput(input) {
        // Sanitize input to prevent XSS
        if (!input || typeof input !== 'string') return '';
        return input.replace(/[<>"'&]/g, '');
    }

    async function handleFormSubmit(event, inputEl, errorEl, responseEl, submitBtn) {
        // Process form submission via fetch with mock fallback
        event.preventDefault();
        FormFeedback.clearError(inputEl, errorEl);
        const email = sanitizeInput(inputEl.value.trim());

        if (!email) {
            FormFeedback.displayError('Email address cannot be empty.', inputEl, errorEl);
            inputEl.focus();
            return;
        }
        if (!isEmailCorrectFormat(email)) {
            FormFeedback.displayError('Oops! Check the email address format.', inputEl, errorEl);
            inputEl.focus();
            return;
        }

        const originalText = submitBtn.querySelector('span')?.textContent || 'Request Access';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        const btnSpan = submitBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = 'Submitting...';
        else submitBtn.textContent = 'Submitting...';

        try {
            // Try real API first, fall back to mock for demo
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // CSRF protection
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 501) {
                    // API endpoint doesn't exist, use mock response for demo
                    throw new Error('MOCK_MODE');
                }
                let msg = 'Submission failed. Please try again.';
                try {
                    const errorData = await response.json();
                    // Only show safe error messages
                    if (errorData.message && !errorData.message.includes('Error:') && !errorData.message.includes('stack')) {
                        msg = errorData.message;
                    }
                } catch { /* ignore JSON parse errors */ }
                throw new Error(msg);
            }

            inputEl.value = '';
            FormFeedback.showSuccessMessage(responseEl);

        } catch (error) {
            let isDemo = false;
            if (error.message === 'MOCK_MODE') {
                isDemo = true;
                // Mock successful submission for demo purposes
                // eslint-disable-next-line no-console
                console.log('API endpoint not available, using mock response');
                setTimeout(() => {
                    inputEl.value = '';
                    responseEl.textContent = '🎉 Thank you! You\'ll receive insider updates soon.';
                    FormFeedback.showSuccessMessage(responseEl);
                }, 1000); // Simulate network delay
            } else {
                const safeErrorMessage = error.message || 'Submission failed. Please try again.';
                FormFeedback.displayError(safeErrorMessage, inputEl, errorEl);
                inputEl.focus();
            }

            // Re-enable button after demo delay or immediately for real errors
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
                if (btnSpan) btnSpan.textContent = originalText;
                else submitBtn.textContent = originalText;
            }, isDemo ? 1000 : 0);
        }
    }

    function handleEmailInput(inputEl, errorEl) {
        // Remove error on new input
        if (inputEl.getAttribute('aria-invalid') === 'true') FormFeedback.clearError(inputEl, errorEl);
    }

    function initializeForm() {
        // Attach form event listeners
        const form = document.getElementById('subscribe-form');
        if (!form) return;
        const input = document.getElementById('emailaddress');
        const error = document.getElementById('email-error');
        const response = document.getElementById('responseMessage');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!input || !error || !response || !submitBtn) return;
        form.setAttribute('novalidate', '');
        form.addEventListener('submit', e => handleFormSubmit(e, input, error, response, submitBtn));
        input.addEventListener('input', () => handleEmailInput(input, error));
    }

    function setupParticles() {
        // Initialize tsParticles background with enhanced error handling
        if (typeof tsParticles === 'undefined') {
            // eslint-disable-next-line no-console
            console.log('tsParticles library not available, skipping particle effects');
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const elem = document.getElementById('tsparticles');
            if (elem) elem.style.display = 'none';
            return;
        }

        // Check if device has limited resources
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        const particleCount = isLowEndDevice ? 60 : 120;

        const config = {
            fpsLimit: 60,
            particles: {
                number: { value: particleCount, density: { enable: true, area: 900 } },
                color: { value: ['#FC109C', '#00E8FF', '#A52AFF', '#FFE800'] },
                shape: { type: 'circle' },
                opacity: { value: { min: 0.1, max: 0.5 }, random: true },
                size: { value: { min: 1, max: 3.5 }, random: true },
                move: {
                    enable: true,
                    speed: { min: 0.3, max: 0.7 },
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out'
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: 'random',
                    opacity: 0.25,
                    width: 1
                },
                twinkle: {
                    particles: {
                        enable: true,
                        frequency: 0.05,
                        opacity: 0.7
                    }
                }
            },
            interactivity: {
                detectsOn: 'canvas',
                events: {
                    onhover: { enable: !isLowEndDevice, mode: 'grab' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 0.4 } },
                    push: { particles_nb: 4 }
                }
            },
            detectRetina: true,
            background: { color: 'transparent' }
        };

        tsParticles.load('tsparticles', config).catch((loadError) => {
            // eslint-disable-next-line no-console
            console.log('Failed to load particles, hiding container:', loadError);
            const elem = document.getElementById('tsparticles');
            if (elem) elem.style.display = 'none';
        });
    }

    function setupMobileMenu() {
        // Configure mobile menu toggle and focus trap (improved implementation)
        const btn = document.getElementById('mobile-menu-button');
        const closeBtn = document.getElementById('close-mobile-menu');
        const menu = document.getElementById('mobile-menu');

        // Create mobile menu if it doesn't exist
        if (!menu && btn) {
            createMobileMenu();
            return setupMobileMenu(); // Retry after creation
        }

        if (!btn || !menu) {
            // eslint-disable-next-line no-console
            console.log('Mobile menu elements not found, skipping setup');
            return;
        }

        let firstEl, lastEl;
        const updateEls = () => {
            const items = Array.from(menu.querySelectorAll('a[href], button:not([disabled])'));
            firstEl = items[0];
            lastEl = items[items.length - 1];
        };

        const handleTrap = e => {
            if (e.key !== 'Tab' || !firstEl || !lastEl) return;
            if (e.shiftKey && document.activeElement === firstEl) {
                lastEl.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                firstEl.focus();
                e.preventDefault();
            }
        };

        const toggle = show => {
            menu.classList.toggle('hidden', !show);
            btn.setAttribute('aria-expanded', show);
            document.body.classList.toggle('no-scroll', show);

            if (show) {
                updateEls();
                requestAnimationFrame(() => {
                    if (closeBtn) closeBtn.focus();
                    else if (firstEl) firstEl.focus();
                });
                menu.addEventListener('keydown', handleTrap);
            } else {
                menu.removeEventListener('keydown', handleTrap);
                btn.focus();
            }
        };

        btn.addEventListener('click', () => toggle(true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !menu.classList.contains('hidden')) toggle(false);
        });

        const nav = menu.querySelector('nav');
        if (nav) {
            nav.addEventListener('click', e => {
                if (e.target.closest('.mobile-menu-link')) toggle(false);
            });
        }
    }

    function createMobileMenu() {
        // Create mobile menu structure if missing
        const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
        if (navLinks.length === 0) return;

        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobile-menu';
        mobileMenu.className = 'mobile-menu hidden';
        mobileMenu.setAttribute('aria-hidden', 'true');

        const closeBtn = document.createElement('button');
        closeBtn.id = 'close-mobile-menu';
        closeBtn.className = 'mobile-menu-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close menu');

        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Mobile navigation');

        navLinks.forEach(link => {
            const mobileLink = link.cloneNode(true);
            mobileLink.className = 'mobile-menu-link';
            nav.appendChild(mobileLink);
        });

        mobileMenu.appendChild(closeBtn);
        mobileMenu.appendChild(nav);
        document.body.appendChild(mobileMenu);
    }

    function setCurrentYear() {
        // Set footer year dynamically
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    function initialize() {
        initializeForm();
        setupParticles();
        setupMobileMenu();
        setCurrentYear();
        registerServiceWorker();
    }

    function registerServiceWorker() {
        // Register service worker for caching and offline functionality
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        // eslint-disable-next-line no-console
                        console.log('Service Worker registered successfully:', registration.scope);
                    })
                    .catch(swError => {
                        // eslint-disable-next-line no-console
                        console.log('Service Worker registration failed:', swError);
                    });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
