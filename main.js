// WARNING: Hardcoding API keys/IDs in frontend code is insecure.
// Consider using environment variables and a backend proxy for production.
const HUBSPOT_PORTAL_ID = "144715652";
const HUBSPOT_FORM_ID = "af2a733d-8790-4d20-b8fa-49571aa6c6ff";
const HUBSPOT_API_BASE = "https://api.hsforms.com/submissions/v3/integration/submit";

let subscribeForm, button, buttonText, emailInput, emailError, responseMessage;

/**
 * Displays an error message for the email input field.
 * @param {string} message - Error message to display
 */
function displayError(message) {
    if (!emailError || !emailInput) return;
    emailError.textContent = message;
    emailError.classList.remove('hidden');
    emailInput.classList.add('error');
    emailInput.setAttribute('aria-invalid', 'true');
    emailInput.setAttribute('aria-describedby', 'email-error');
}

/**
 * Clears error message and resets styling.
 */
function clearError() {
    if (!emailError || !emailInput) return;
    emailError.classList.add('hidden');
    emailInput.classList.remove('error');
    emailInput.setAttribute('aria-invalid', 'false');
    emailInput.removeAttribute('aria-describedby');
}

/**
 * Shows a temporary success message.
 */
function showSuccessMessage() {
    if (!responseMessage) return;
    responseMessage.classList.remove('opacity-0', '-translate-y-16');
    responseMessage.classList.add('opacity-100', 'translate-y-0');

    // Clear existing timeout
    const existingTimeoutId = responseMessage.dataset.timeoutId;
    if (existingTimeoutId) {
        clearTimeout(parseInt(existingTimeoutId, 10));
    }

    const timeoutId = setTimeout(() => {
        responseMessage.classList.remove('opacity-100', 'translate-y-0');
        responseMessage.classList.add('opacity-0', '-translate-y-16');
        responseMessage.removeAttribute('data-timeout-id');
    }, 2800);

    // Store timeout ID
    responseMessage.dataset.timeoutId = timeoutId.toString();
}

/**
 * Sets form loading state.
 * @param {boolean} isLoading - Loading state flag
 */
function setLoadingState(isLoading) {
    if (!button || !emailInput) return;
    button.classList.toggle('loading', isLoading);
    button.disabled = isLoading;
    emailInput.disabled = isLoading;
}

/**
 * Validates email format.
 * @param {string} email - Email to validate
 * @returns {boolean} - Valid or not
 */
function isEmailCorrectFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Submits email to Hubspot API.
 * @param {string} email - Email to submit
 * @returns {Promise<boolean>} - Success status
 */
async function submitToHubspot(email) {
    const request_url = `${HUBSPOT_API_BASE}/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;
    const body = {
        submittedAt: Date.now(),
        fields: [{ objectTypeId: "0-1", name: "email", value: email }]
    };

    try {
        const response = await fetch(request_url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            // Get specific error from Hubspot if available
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) { /* Ignore parsing error */ }

            const specificMessage = errorData?.message || `HTTP error ${response.status}`;
            throw new Error(`Submission error (${specificMessage}). Please try again later.`);
        }
        return true;
    } catch (error) {
        if (error.message.startsWith("Submission error")) {
            throw error; // API specific error
        } else {
            // Network/connection error
            throw new Error("Network issue. Check connection & retry.");
        }
    }
}

/**
 * Handles form submission.
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    if (!emailInput || !buttonText || !responseMessage) return;

    clearError();
    const email = emailInput.value.trim();

    // Validate email
    if (!isEmailCorrectFormat(email)) {
        displayError("Oops! Invalid email format. Please check.");
        emailInput.focus();
        return;
    }

    setLoadingState(true);

    try {
        await submitToHubspot(email);
        emailInput.value = '';
        showSuccessMessage();
    } catch (error) {
        displayError(error.message || "An unexpected error occurred. Please try again.");
        emailInput.focus();
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handles email input changes.
 */
function handleEmailInput() {
    if (emailInput?.getAttribute('aria-invalid') === 'true') {
        clearError();
    }
}

/**
 * Sets up animations with IntersectionObserver.
 */
function setupAnimations() {
    const animatedElements = document.querySelectorAll('.animated-element');
    if (!animatedElements.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        if (entry.target.style.animationPlayState !== 'running') {
                            entry.target.style.animationPlayState = 'running';
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
            el.style.animationDelay = el.style.getPropertyValue('--animation-delay') || '0s';
            observer.observe(el);
        });
    } else {
        console.warn("IntersectionObserver not supported, animations will run immediately.");
        animatedElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.animationPlayState = 'running';
        });
    }
}

/**
 * Sets up tsParticles background effect.
 */
function setupParticles() {
    if (typeof tsParticles === 'undefined') {
        console.warn("tsParticles library not loaded.");
        return;
    }

    tsParticles.load("tsparticles", {
        fpsLimit: 60,
        particles: {
            number: {
                value: 50, // Adjust particle count
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#00E8FF", "#FC109C", "#A52AFF", "#FF1090"] // Use theme colors
            },
            shape: {
                type: "line", // Use lines for a grid/network effect
            },
            opacity: {
                value: 0.4, // Slightly transparent
                random: true,
                anim: {
                    enable: true,
                    speed: 0.5,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 1,
                random: false, // Keep lines thin
            },
            line_linked: {
                enable: true,
                distance: 130, // Connection distance
                color: "#A0A0B5", // Use text-medium color
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5, // Movement speed
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out", // Particles leave the screen
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab" // Connect particles on hover
                },
                onclick: {
                    enable: false, // Disable click interaction
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 160, // Grab distance
                    line_opacity: 0.6
                },
                bubble: { /* Disabled */ },
                repulse: { /* Disabled */ },
                push: { /* Disabled */ },
                remove: { /* Disabled */ }
            }
        },
        retina_detect: true,
        // Ensure particles are behind content if z-index issues arise
        // zIndex: {
        //     value: -1,
        // }
    });
}


/**
 * Sets up Vanilla Tilt effect on elements.
 */
function setupTilt() {
    if (typeof VanillaTilt === 'undefined') {
        console.warn("VanillaTilt library not loaded.");
        return;
    }
    const tiltElements = document.querySelectorAll('.tilt-element');
    if (tiltElements.length > 0) {
        VanillaTilt.init(tiltElements, {
            max: 8, // Max tilt rotation (degrees)
            perspective: 1000, // Transform perspective, the lower the more extreme the tilt gets.
            scale: 1.02, // 2% increase size on hover
            speed: 400, // Speed of the enter/exit transition
            glare: true, // If it should have a "glare" effect
            "max-glare": 0.3 // From 0 - 1.
        });
    }
}


/**
 * Initialize all functionality.
 */
function initialize() {
    // Get DOM elements
    subscribeForm = document.getElementById("subscribe-form");
    button = document.getElementById("button");
    buttonText = button?.querySelector('.button-text');
    emailInput = document.getElementById("emailaddress");
    emailError = document.getElementById("email-error");
    responseMessage = document.getElementById("responseMessage");

    if (!subscribeForm || !button || !emailInput || !emailError || !responseMessage) {
        console.warn("Essential form elements missing. Form functionality disabled.");
        if (button) button.disabled = true;
        if (subscribeForm) subscribeForm.style.opacity = '0.7';
        // Don't return early if form elements missing, effects might still work
    } else {
        // Add form event listeners only if elements exist
        subscribeForm.addEventListener('submit', handleFormSubmit);
        emailInput.addEventListener('input', handleEmailInput);
    }

    // Set up animations
    setupAnimations();

    // Set up visual effects
    setupParticles();
    setupTilt();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}