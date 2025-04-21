'use strict';

// --- Form Handling ---

/**
 * Displays a validation error message for a form field.
 * @param {string} message - The error message content.
 * @param {object} elements - Object containing DOM elements: error, input.
 */
function displayError(message, { error, input }) {
    if (!error || !input) return;
    error.textContent = message;
    error.classList.add('visible');
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'email-error'); // Link input to error message for screen readers
}

/**
 * Clears the validation error message and resets styles for a form field.
 * @param {object} elements - Object containing DOM elements: error, input.
 */
function clearError({ error, input }) {
    if (!error || !input) return;
    error.textContent = '';
    error.classList.remove('visible');
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
}

/**
 * Displays a confirmation message and hides it after a delay.
 * @param {object} elements - Object containing the response message DOM element: response.
 */
function showSuccessMessage({ response }) {
    if (!response) return;

    // Clear any existing timeout to prevent multiple timers
    clearTimeout(response.dataset.timeoutId);

    response.classList.add('visible');

    // Set timer to hide the message
    const timeoutId = setTimeout(() => {
        response.classList.remove('visible');
        delete response.dataset.timeoutId; // Clean up data attribute
    }, 2800); // Message display duration (2.8 seconds)

    // Store timer ID in data attribute to allow cancellation
    response.dataset.timeoutId = timeoutId;
}

/**
 * Validates email format using a simple regex.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the format is valid, false otherwise.
 */
function isEmailCorrectFormat(email) {
    // Basic regex: checks for characters before @, characters after @, a dot, and 2+ letters at the end.
    // Consider a more robust regex or library for production if needed.
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Handles the subscription form submission event.
 * Validates email, displays errors, or logs email and shows success.
 * @param {Event} event - The 'submit' event object.
 * @param {object} elements - Object containing form DOM elements.
 */
function handleFormSubmit(event, elements) {
    event.preventDefault(); // Prevent default page reload
    const { input } = elements;
    if (!input) return;

    clearError(elements);
    const email = input.value.trim();

    if (!email) {
        displayError("Email address cannot be empty.", elements);
        input.focus();
        return;
    }
    if (!isEmailCorrectFormat(email)) {
        displayError("Oops! Check the email address format.", elements);
        input.focus();
        return;
    }

    // --- Form Submission Logic ---
    // TODO: Replace console.log with actual backend API call (e.g., using fetch POST)
    console.log("Form submitted with email:", email);
    // Example:
    // fetch('/api/subscribe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    // })
    // .then(response => {
    //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    //     return response.json();
    // })
    // .then(data => {
    //     console.log('Success:', data);
    //     input.value = ''; // Clear on success
    //     showSuccessMessage(elements);
    // })
    // .catch((error) => {
    //     console.error('Error:', error);
    //     displayError("Submission failed. Please try again later.", elements); // Display user-friendly error
    // });

    input.value = ''; // Clear input field after "submission" (remove if handled in fetch success)
    showSuccessMessage(elements);
}

/**
 * Handles the input event on the email field.
 * Clears the error message if the user starts correcting an invalid email.
 * @param {object} elements - Object containing form DOM elements.
 */
function handleEmailInput(elements) {
    // Clear error only if the field was previously marked as invalid
    if (elements.input?.classList.contains('error')) {
        clearError(elements);
    }
}

/**
 * Initializes subscription form event listeners.
 */
function initializeForm() {
    const form = document.getElementById("subscribe-form");
    const input = document.getElementById("emailaddress");
    const error = document.getElementById("email-error");
    const response = document.getElementById("responseMessage");

    if (!form || !input || !error || !response) {
        console.warn("Subscription form elements not found. Form functionality disabled.");
        return;
    }

    const formElements = { form, input, error, response };
    form.addEventListener('submit', (e) => handleFormSubmit(e, formElements));
    input.addEventListener('input', () => handleEmailInput(formElements));
}

// --- UI Configuration ---

/**
 * Configures and initializes the tsParticles background animation.
 */
function setupParticles() {
    if (typeof tsParticles === 'undefined') {
        console.warn("tsParticles library not loaded. Skipping particle setup.");
        return;
    }

    // --- Restore Original Particle Configuration ---
    const particleConfig = {
        fpsLimit: 45, // Lower FPS limit for potentially better performance
        particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } }, // Slightly fewer particles
            color: { value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"] }, // Miami colors
            shape: { type: "circle" },
            opacity: { value: { min: 0.1, max: 0.4 }, animation: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false } },
            size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false } },
            links: { enable: true, distance: 140, color: "#00E8FF", opacity: 0.15, width: 1 }, // Slightly adjusted links
            move: { enable: true, speed: 0.7, direction: "none", random: true, straight: false, outModes: { default: "out" }, attract: { enable: false } } // Slightly slower speed
        },
        interactivity: {
            detectsOn: "canvas",
            events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: false }, // No click interaction
                resize: { enable: true }
            },
            modes: {
                repulse: { distance: 80, duration: 0.4 } // Smaller repulse distance
            }
        },
        detectRetina: true,
        background: { color: "transparent" } // Transparent background
    };
    // --- End of Original Configuration ---

    console.log("Attempting to load tsParticles with original config..."); // Log before loading

    tsParticles.load("tsparticles", particleConfig) // Use the original config
        .then(container => {
            console.log("tsParticles loaded successfully with original config!", container); // Log success
        })
        .catch(err => {
            console.error("Error loading tsParticles with original config:", err); // Log error
            const particlesElement = document.getElementById('tsparticles');
            if (particlesElement) {
                particlesElement.style.display = 'none'; // Hide background on error
            }
        });
}

/**
 * Initializes mobile menu functionality (toggle, navigation, accessibility).
 */
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuNav = mobileMenu?.querySelector('nav'); // Target the nav element

    if (!mobileMenuButton || !closeMobileMenuButton || !mobileMenu || !mobileMenuNav) {
        console.warn("Mobile menu elements not found. Menu functionality disabled.");
        return;
    }

    const toggleMenu = (show) => {
        mobileMenu.classList.toggle('hidden', !show);
        mobileMenuButton.setAttribute('aria-expanded', String(show));
        document.body.classList.toggle('no-scroll', show); // Prevent body scroll when menu is open

        // Manage focus for accessibility
        if (show) {
            closeMobileMenuButton.focus(); // Focus on close button when opened
        } else {
            mobileMenuButton.focus(); // Return focus to menu button when closed
        }
    };

    mobileMenuButton.addEventListener('click', () => toggleMenu(true));
    closeMobileMenuButton.addEventListener('click', () => toggleMenu(false));

    // Close menu when a link inside the nav is clicked
    mobileMenuNav.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-menu-link')) {
            toggleMenu(false);
        }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMenu(false);
        }
    });
}

/**
 * Sets the current year in the footer element with ID 'current-year'.
 */
function setCurrentYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear().toString();
    } else {
        console.warn("Current year element not found in footer.");
    }
}

/**
 * Configures smooth scrolling for navigation links.
 */
function setupSmoothScroll() {
    // Selects nav links, mobile links, and the CTA button if it links to a hash
    document.querySelectorAll('.nav-link, .mobile-menu-link, .btn[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Check if it's a valid internal hash link and default wasn't prevented
            if (targetId?.startsWith('#') && targetId.length > 1 && !e.defaultPrevented) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault(); // Prevent default anchor jump only if target exists
                        // Smoothly scroll the target element into the center of the view
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        console.warn(`Smooth scroll target not found: ${targetId}`);
                    }
                } catch (error) {
                    // Catch potential errors from invalid selectors
                    console.error(`Error finding smooth scroll target: ${targetId}`, error);
                }
            }
        });
    });
}

// --- Initialization ---

/**
 * Main initialization function for all page components.
 */
function initialize() {
    initializeForm();
    setupParticles(); // Using the original config now
    setupMobileMenu();
    setCurrentYear();
    // setupSmoothScroll(); // Keep commented out for now
}

// Run initialization after the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize(); // DOM is already ready
}