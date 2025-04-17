'use strict';

/**
 * Displays an error message for a form field.
 * @param {string} message - The error message to display.
 * @param {object} elements - Object containing { error: HTMLElement, input: HTMLInputElement }.
 */
function displayError(message, elements) {
    const { error, input } = elements;
    if (!error || !input) {
        console.warn("displayError: Missing error or input element.");
        return;
    }
    error.textContent = message;
    error.classList.add('visible');
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'email-error');
}

/**
 * Clears the error message for a form field.
 * @param {object} elements - Object containing { error: HTMLElement, input: HTMLInputElement }.
 */
function clearError(elements) {
    const { error, input } = elements;
    if (!error || !input) {
        console.warn("clearError: Missing error or input element.");
        return;
    }
    error.textContent = '';
    error.classList.remove('visible');
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
}

/**
 * Shows a success message notification.
 * @param {object} elements - Object containing { response: HTMLElement }.
 */
function showSuccessMessage(elements) {
    const { response } = elements;
    if (!response) {
        console.warn("showSuccessMessage: Missing response element.");
        return;
    }
    response.classList.add('visible');

    const existingTimeoutId = response.dataset.timeoutId;
    if (existingTimeoutId) {
        clearTimeout(parseInt(existingTimeoutId, 10));
    }

    const timeoutId = setTimeout(() => {
        response.classList.remove('visible');
        response.removeAttribute('data-timeout-id');
    }, 2800);

    response.dataset.timeoutId = timeoutId.toString();
}

/**
 * Validates email format using a regular expression.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email format is valid, false otherwise.
 */
function isEmailCorrectFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Handles the form submission event.
 * @param {Event} event - The form submission event.
 * @param {object} elements - Object containing form elements { form, input, error, response }.
 */
function handleFormSubmit(event, elements) {
    event.preventDefault();
    const { input } = elements;
    if (!input) {
        console.error("handleFormSubmit: Input element not provided.");
        return;
    }

    clearError(elements);
    const email = input.value.trim();

    if (!email) {
        displayError("Email address cannot be empty.", elements);
        input.focus();
        return;
    }
    if (!isEmailCorrectFormat(email)) {
        displayError("Oops! Invalid email format. Please check.", elements);
        input.focus();
        return;
    }

    // TODO: Replace with actual form submission logic (e.g., fetch API call)
    console.log("Form submitted (simulation):", email);
    input.value = '';
    showSuccessMessage(elements);
}

/**
 * Handles input events on the email field, clearing errors on interaction.
 * @param {object} elements - Object containing { input, error }.
 */
function handleEmailInput(elements) {
    const { input } = elements;
    if (input?.getAttribute('aria-invalid') === 'true') {
        clearError(elements);
    }
}

/**
 * Initializes the tsParticles background animation.
 */
function setupParticles() {
    if (typeof tsParticles === 'undefined') {
        console.warn("tsParticles library not found. Background animation disabled.");
        return;
    }

    tsParticles.load("tsparticles", {
        fpsLimit: 45,
        particles: {
            number: {
                value: 80,
                density: { enable: true, value_area: 800 }
            },
            color: { value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"] },
            shape: { type: "circle" },
            opacity: {
                value: { min: 0.1, max: 0.4 },
                random: true,
                anim: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false }
            },
            size: {
                value: { min: 1, max: 3 },
                random: true,
                anim: { enable: true, speed: 2, minimumValue: 0.5, sync: false }
            },
            links: {
                enable: true,
                distance: 130,
                color: "#00E8FF",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.8,
                direction: "none",
                random: true,
                straight: false,
                outModes: {
                    default: "out"
                },
                attract: { enable: false }
            }
        },
        interactivity: {
            detectsOn: "canvas",
            events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: false },
                resize: { enable: true }
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4
                }
            }
        },
        detectRetina: true,
        background: {
            color: "transparent"
        }
    })
        .then(container => {
            if (container) {
                console.log("tsParticles loaded successfully.");
            } else {
                console.warn("tsParticles container failed to initialize.");
            }
        })
        .catch(err => {
            console.error("Failed to load tsParticles configuration:", err);
            const particlesElement = document.getElementById('tsparticles');
            if (particlesElement) particlesElement.style.display = 'none';
        });
}


/**
 * Sets up the mobile menu toggle and interaction logic.
 */
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = mobileMenu?.querySelectorAll('.mobile-menu-link');

    if (!mobileMenuButton || !closeMobileMenuButton || !mobileMenu || !mobileMenuLinks?.length) {
        console.warn("Mobile menu elements not found. Menu functionality disabled.");
        return;
    }

    const toggleMenu = (show) => {
        if (!mobileMenu || !mobileMenuButton || !closeMobileMenuButton) return;

        mobileMenu.classList.toggle('hidden', !show);
        mobileMenuButton.setAttribute('aria-expanded', String(show));
        document.body.classList.toggle('no-scroll', show);

        if (show) {
            closeMobileMenuButton.focus();
        } else {
            mobileMenuButton.focus();
        }
    };

    mobileMenuButton.addEventListener('click', () => toggleMenu(true));
    closeMobileMenuButton.addEventListener('click', () => toggleMenu(false));

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMenu(false);
        }
    });
}

/**
 * Sets the current year in the footer.
 */
function setCurrentYear() {
    try {
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear().toString();
        } else {
            console.warn("Current year element not found in the footer.");
        }
    } catch (e) {
        console.error("Failed to set current year:", e);
    }
}

/**
 * Initializes the subscription form elements and event listeners.
 */
function initializeForm() {
    const form = document.getElementById("subscribe-form");
    const input = document.getElementById("emailaddress");
    const error = document.getElementById("email-error");
    const response = document.getElementById("responseMessage");

    if (!form || !input || !error || !response) {
        console.warn("Subscription form elements missing. Form functionality disabled.");
        return;
    }

    const formElements = { form, input, error, response };

    form.addEventListener('submit', e => handleFormSubmit(e, formElements));
    input.addEventListener('input', () => handleEmailInput(formElements));
}

/**
 * Sets up smooth scrolling for internal navigation links.
 */
function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-link, .cta-btn[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    console.warn(`Smooth scroll target not found: ${targetId}`);
                }
            }
        });
    });
}


/**
 * Initializes all application components.
 */
function initialize() {
    console.log("Initializing application...");
    initializeForm();
    setupParticles();
    setupMobileMenu();
    setCurrentYear();
    setupSmoothScroll();
    console.log("Application initialized.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}