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
    emailError.classList.add('visible');
    emailInput.classList.add('error');
    emailInput.setAttribute('aria-invalid', 'true');
    emailInput.setAttribute('aria-describedby', 'email-error');
}

/**
 * Clears error message and resets styling.
 */
function clearError() {
    if (!emailError || !emailInput) return;
    emailError.classList.remove('visible');
    emailInput.classList.remove('error');
    emailInput.setAttribute('aria-invalid', 'false');
    emailInput.removeAttribute('aria-describedby');
}

/**
 * Shows a temporary success message.
 */
function showSuccessMessage() {
    if (!responseMessage) return;
    responseMessage.classList.add('visible');

    // Clear existing timeout
    const existingTimeoutId = responseMessage.dataset.timeoutId;
    if (existingTimeoutId) {
        clearTimeout(parseInt(existingTimeoutId, 10));
    }

    const timeoutId = setTimeout(() => {
        responseMessage.classList.remove('visible');
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
async function handleFormSubmit(event, elements) {
    event.preventDefault();
    const { input, buttonText, response } = elements;
    if (!input || !buttonText || !response) return;

    clearError();
    const email = input.value.trim();

    // Validate email
    if (!isEmailCorrectFormat(email)) {
        displayError("Oops! Invalid email format. Please check.");
        input.focus();
        return;
    }

    setLoadingState(true);

    try {
        await submitToHubspot(email);
        input.value = '';
        showSuccessMessage();
    } catch (error) {
        displayError(error.message || "An unexpected error occurred. Please try again.");
        input.focus();
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handles email input changes.
 */
function handleEmailInput(elements) {
    const { input } = elements;
    if (input?.getAttribute('aria-invalid') === 'true') {
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

// Zoptymalizowana funkcja cząstek tła
function setupParticles() {
    if (typeof tsParticles === 'undefined') return;

    tsParticles.load("tsparticles", {
        fpsLimit: 60,
        particles: {
            number: {
                value: 50,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"]
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                }
            },
            opacity: {
                value: 0.25,
                random: true,
                anim: {
                    enable: true,
                    speed: 0.5,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#00E8FF",
                opacity: 0.15,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
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
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.8
                    }
                },
                push: {
                    particles_nb: 3
                }
            }
        },
        retina_detect: true
    });
}

// Eliminacja zbędnych zmiennych i operacji
function initialize() {
    // Pobieranie elementów DOM tylko raz
    const elements = {
        form: document.getElementById("subscribe-form"),
        button: document.getElementById("button"),
        input: document.getElementById("emailaddress"),
        error: document.getElementById("email-error"),
        response: document.getElementById("responseMessage")
    };

    // Inicjalizacja tylko jeśli wszystkie elementy istnieją
    if (Object.values(elements).every(el => el)) {
        elements.form.addEventListener('submit', e => handleFormSubmit(e, elements));
        elements.input.addEventListener('input', () => handleEmailInput(elements));
    }

    setupAnimations();
    setupParticles();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}