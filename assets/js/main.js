function displayError(message, elements) {
    const { error, input } = elements;
    if (!error || !input) return;
    error.textContent = message;
    error.classList.add('visible');
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'email-error');
}

function clearError(elements) {
    const { error, input } = elements;
    if (!error || !input) return;
    error.classList.remove('visible');
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
}

function showSuccessMessage(elements) {
    const { response } = elements;
    if (!response) return;
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

function isEmailCorrectFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

function handleFormSubmit(event, elements) {
    event.preventDefault();
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
        displayError("Oops! Invalid email format. Please check.", elements);
        input.focus();
        return;
    }

    // Simulate Success (Replace with actual submission logic)
    console.log("Form submitted (simulation):", email);
    input.value = '';
    showSuccessMessage(elements);
}

function handleEmailInput(elements) {
    const { input } = elements;
    if (input?.getAttribute('aria-invalid') === 'true') {
        clearError(elements);
    }
}

function setupParticles() {
    if (typeof tsParticles === 'undefined') {
        console.warn("tsParticles library not found.");
        return;
    }

    tsParticles.load("tsparticles", {
        fpsLimit: 45,
        particles: {
            number: {
                value: 100,
                density: { enable: true, value_area: 700 }
            },
            color: { value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"] },
            shape: { type: "circle" },
            opacity: {
                value: 0.3,
                random: true,
                anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false }
            },
            size: {
                value: { min: 1, max: 3 },
                random: true,
                anim: { enable: true, speed: 2, size_min: 0.5, sync: false }
            },
            links: {
                enable: true,
                distance: 120,
                color: "#00E8FF",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.7,
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
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" }, // Keep repulse effect
                onclick: { enable: false },
                resize: true
            },
            modes: {
                repulse: { // Configure repulse
                    distance: 100,
                    duration: 0.4
                }
                // Removed grab mode config as it's not used
            }
        },
        retina_detect: true,
        background: {
            color: "transparent"
        }
    })
        .then(container => {
            console.log("tsParticles loaded successfully.");
        })
        .catch(err => {
            console.error("Failed to load tsParticles:", err);
            const particlesElement = document.getElementById('tsparticles');
            if (particlesElement) particlesElement.style.display = 'none';
        });
}

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = mobileMenu?.querySelectorAll('.mobile-menu-link'); // Use optional chaining

    if (!mobileMenuButton || !closeMobileMenuButton || !mobileMenu || !mobileMenuLinks?.length) {
        console.warn("Mobile menu elements not found. Menu functionality disabled.");
        return;
    }

    const toggleMenu = (show) => {
        mobileMenu.classList.toggle('hidden', !show);
        mobileMenuButton.setAttribute('aria-expanded', String(show));
        // Consider adding focus trap logic here for accessibility
    };

    mobileMenuButton.addEventListener('click', () => toggleMenu(true));
    closeMobileMenuButton.addEventListener('click', () => toggleMenu(false));
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMenu(false);
        }
    });
}

function setCurrentYear() {
    try {
        const currentYearElement = document.getElementById('current-year');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    } catch (e) {
        console.error("Failed to set current year:", e);
    }
}

function initializeForm() {
    const formElements = {
        form: document.getElementById("subscribe-form"),
        input: document.getElementById("emailaddress"),
        error: document.getElementById("email-error"),
        response: document.getElementById("responseMessage")
    };

    // Check if all essential form elements exist
    if (Object.values(formElements).some(el => !el)) {
        console.warn("Subscription form elements not found. Form functionality disabled.");
        return;
    }

    formElements.form.addEventListener('submit', e => handleFormSubmit(e, formElements));
    formElements.input.addEventListener('input', () => handleEmailInput(formElements));
}


function initialize() {
    initializeForm();
    setupParticles();
    setupMobileMenu();
    setCurrentYear();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // Use setTimeout to ensure it runs after the current call stack
    // Useful if the script is loaded asynchronously or deferred late
    setTimeout(initialize, 0);
}