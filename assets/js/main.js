'use strict';

// Wrap all code in an IIFE to avoid polluting the global scope
(function () {

    /**
     * Manages UI feedback for form validation and submission, including ARIA attributes.
     */
    const FormFeedback = {
        /**
         * Displays a validation error message for a form field.
         * @param {string} message - The error message content.
         * @param {HTMLInputElement} inputEl - The input element.
         * @param {HTMLElement} errorEl - The error message element.
         */
        displayError(message, inputEl, errorEl) {
            if (!errorEl || !inputEl) return;
            errorEl.textContent = message;
            errorEl.classList.add('visible'); // Make error visible
            inputEl.classList.add('error'); // Style input as invalid
            inputEl.setAttribute('aria-invalid', 'true');
            // Ensure errorEl has an ID for aria-describedby
            if (errorEl.id) {
                inputEl.setAttribute('aria-describedby', errorEl.id);
            }
        },

        /**
         * Clears the validation error message and resets styles/ARIA attributes for a form field.
         * @param {HTMLInputElement} inputEl - The input element.
         * @param {HTMLElement} errorEl - The error message element.
         */
        clearError(inputEl, errorEl) {
            if (!errorEl || !inputEl) return;
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
            inputEl.classList.remove('error');
            inputEl.removeAttribute('aria-invalid');
            inputEl.removeAttribute('aria-describedby');
        },

        /**
         * Displays a confirmation message and hides it after a delay.
         * Assumes responseEl has aria-live="polite" in the HTML for screen readers.
         * @param {HTMLElement} responseEl - The response message element.
         */
        showSuccessMessage(responseEl) {
            if (!responseEl) return;

            // Use a data attribute to manage the timeout ID
            let timeoutId = responseEl.dataset.timeoutId ? parseInt(responseEl.dataset.timeoutId, 10) : null;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            responseEl.classList.add('visible');

            timeoutId = setTimeout(() => {
                responseEl.classList.remove('visible');
                delete responseEl.dataset.timeoutId; // Clean up
            }, 2800);

            responseEl.dataset.timeoutId = String(timeoutId); // Store new timeout ID
        }
    };

    /**
     * Validates email format using a standard HTML5-compliant regex.
     * @param {string} email - The email address to validate.
     * @returns {boolean} - True if the format is valid, false otherwise.
     */
    function isEmailCorrectFormat(email) {
        // More robust regex based on HTML5 spec, allows longer TLDs and common characters
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
    }

    /**
     * Handles the subscription form submission, validation, and feedback.
     * @param {Event} event - The 'submit' event object.
     * @param {HTMLInputElement} inputEl - The email input element.
     * @param {HTMLElement} errorEl - The error message element.
     * @param {HTMLElement} responseEl - The success response element.
     * @param {HTMLButtonElement} submitBtn - The submit button element.
     */
    async function handleFormSubmit(event, inputEl, errorEl, responseEl, submitBtn) {
        event.preventDefault();
        // Elements are checked in initializeForm, assume they exist here

        FormFeedback.clearError(inputEl, errorEl);
        const email = inputEl.value.trim();

        if (!email) {
            FormFeedback.displayError("Email address cannot be empty.", inputEl, errorEl);
            inputEl.focus();
            return;
        }
        if (!isEmailCorrectFormat(email)) {
            FormFeedback.displayError("Oops! Check the email address format.", inputEl, errorEl);
            inputEl.focus();
            return;
        }

        // Disable button and provide visual/ARIA feedback during submission
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'Submitting...'; // Provide user feedback

        try {
            const response = await fetch('/api/subscribe', { // Use your actual API endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Expect JSON response
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                let errorMessage = `Submission failed. Status: ${response.status}`;
                try {
                    // Attempt to parse server error message if available (JSON format)
                    const errData = await response.json();
                    // Use server message if provided, otherwise stick to status-based message
                    errorMessage = errData?.message || errorMessage;
                } catch (parseError) {
                    // Server response wasn't JSON or parsing failed
                    errorMessage = response.statusText || errorMessage;
                    console.warn('Could not parse error response as JSON.', parseError);
                }
                // Throw an error to be caught by the catch block
                throw new Error(errorMessage);
            }

            // Success case
            inputEl.value = ''; // Clear input on success
            FormFeedback.showSuccessMessage(responseEl); // Show success feedback

        } catch (error) {
            console.error('Form submission error:', error);
            // Display a user-friendly error message using the caught error's message
            FormFeedback.displayError(error.message || "Submission failed. Please try again later.", inputEl, errorEl);
            inputEl.focus(); // Focus input for correction after error
        } finally {
            // Always re-enable button and restore state
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            // Restore original button text (consider storing it if it might change)
            submitBtn.textContent = 'Get MVE Reports & Data';
        }
    }

    /**
     * Handles the input event on the email field to clear errors dynamically.
     * @param {HTMLInputElement} inputEl - The email input element.
     * @param {HTMLElement} errorEl - The error message element.
     */
    function handleEmailInput(inputEl, errorEl) {
        // Clear error only if currently invalid
        if (inputEl.getAttribute('aria-invalid') === 'true') {
            FormFeedback.clearError(inputEl, errorEl);
        }
    }

    /**
     * Initializes subscription form event listeners and caches elements.
     */
    function initializeForm() {
        const form = document.getElementById("subscribe-form");
        if (!form) return; // Exit if form not found

        const input = document.getElementById("emailaddress");
        const error = document.getElementById("email-error");
        const response = document.getElementById("responseMessage");
        const submitBtn = form.querySelector('button[type="submit"]');

        // Ensure all required elements are present
        if (!input || !error || !response || !submitBtn) {
            console.warn("Subscription form elements missing. Functionality disabled.");
            return;
        }

        // Disable default browser validation; rely on custom JS validation
        form.setAttribute('novalidate', '');

        form.addEventListener('submit', (e) => handleFormSubmit(e, input, error, response, submitBtn));
        // Use 'input' event for real-time feedback as user types
        input.addEventListener('input', () => handleEmailInput(input, error));
    }

    /**
     * Configures and initializes the tsParticles background animation.
     */
    function setupParticles() {
        if (typeof tsParticles === 'undefined') {
            console.warn("tsParticles library not found. Background animation disabled.");
            return;
        }

        // Respect user preference for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.info("Reduced motion preference detected. Skipping particle animation.");
            const particlesElement = document.getElementById('tsparticles');
            if (particlesElement) particlesElement.style.display = 'none'; // Hide container
            return;
        }

        // Particle configuration (optimized slightly)
        const particleConfig = {
            fpsLimit: 60,
            particles: {
                number: { value: 80, density: { enable: true, area: 800 } }, // Slightly fewer particles
                color: { value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"] },
                shape: { type: "circle" },
                opacity: { value: { min: 0.1, max: 0.5 }, animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false } }, // Slightly more subtle
                size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false } }, // Slightly smaller max size
                links: { enable: true, distance: 150, color: "#00E8FF", opacity: 0.15, width: 1 }, // Slightly increased distance, reduced opacity
                move: { enable: true, speed: 0.8, direction: "none", random: true, straight: false, outModes: { default: "out" }, attract: { enable: false } } // Slightly slower
            },
            interactivity: {
                detectsOn: "window",
                events: {
                    onHover: { enable: false }, // Keep disabled
                    onClick: { enable: false }, // Keep disabled
                    resize: { enable: true }
                }
            },
            detectRetina: true,
            background: { color: "transparent" }
        };

        tsParticles.load("tsparticles", particleConfig)
            .catch(err => {
                console.error("Error loading tsParticles:", err);
                const particlesElement = document.getElementById('tsparticles');
                if (particlesElement) particlesElement.style.display = 'none'; // Hide on error
            });
    }

    /**
     * Initializes mobile menu functionality (toggle, navigation, accessibility).
     */
    function setupMobileMenu() {
        const menuButton = document.getElementById('mobile-menu-button');
        const closeButton = document.getElementById('close-mobile-menu');
        const menu = document.getElementById('mobile-menu');

        if (!menuButton || !closeButton || !menu) {
            console.warn("Mobile menu elements missing. Functionality disabled.");
            return;
        }

        const nav = menu.querySelector('nav');
        const focusableElementsString = 'a[href], button:not([disabled])'; // Simplified selector
        let firstFocusableElement, lastFocusableElement;

        /** Updates the list of focusable elements within the menu */
        const updateFocusableElements = () => {
            const focusableContent = Array.from(menu.querySelectorAll(focusableElementsString));
            firstFocusableElement = focusableContent[0];
            lastFocusableElement = focusableContent[focusableContent.length - 1];
        };

        /** Toggles the mobile menu visibility and accessibility states. */
        const toggleMenu = (show) => {
            const isVisible = !menu.classList.contains('hidden');
            if (show === isVisible) return; // Avoid redundant toggling

            menu.classList.toggle('hidden', !show);
            menuButton.setAttribute('aria-expanded', String(show));
            // aria-hidden is implicitly handled by 'hidden' class / display: none

            document.body.classList.toggle('no-scroll', show);

            if (show) {
                updateFocusableElements();
                // Delay focus slightly to ensure elements are visible and transition completes
                requestAnimationFrame(() => {
                    // Check if closeButton exists before focusing
                    if (closeButton) closeButton.focus();
                });
                menu.addEventListener('keydown', handleMenuTrapFocus);
            } else {
                menu.removeEventListener('keydown', handleMenuTrapFocus);
                // Return focus to the button that opened the menu
                if (menuButton) menuButton.focus();
            }
        };

        /** Traps focus within the mobile menu when it's open */
        const handleMenuTrapFocus = (e) => {
            if (e.key !== 'Tab' || !firstFocusableElement || !lastFocusableElement) return;

            const isShiftPressed = e.shiftKey;

            if (isShiftPressed) { // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        };

        // Event listeners
        menuButton.addEventListener('click', () => toggleMenu(true));
        closeButton.addEventListener('click', () => toggleMenu(false));

        // Close menu when a navigation link is clicked
        if (nav) {
            nav.addEventListener('click', (e) => {
                // Close only if a link inside the nav is clicked
                if (e.target.closest('.mobile-menu-link')) {
                    toggleMenu(false);
                }
            });
        } else {
            console.warn("Mobile menu 'nav' element not found.");
        }

        // Close menu on 'Escape' key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
                toggleMenu(false);
            }
        });
    }

    /**
     * Sets the current year in the footer.
     */
    function setCurrentYear() {
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear().toString();
        } else {
            console.warn("Element with ID 'current-year' not found.");
        }
    }

    /**
     * Main initialization function called after the DOM is ready.
     */
    function initialize() {
        initializeForm();
        setupParticles();
        setupMobileMenu();
        setCurrentYear();
    }

    // Initialize after DOM content is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize(); // DOM is already ready
    }

})();