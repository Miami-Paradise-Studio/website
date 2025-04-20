'use strict';

// Wyświetla komunikat błędu w formularzu
function displayError(message, { error, input }) {
    if (!error || !input) return;
    error.textContent = message;
    error.classList.add('visible');
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'email-error');
}

// Usuwa komunikat błędu z formularza
function clearError({ error, input }) {
    if (!error || !input) return;
    error.textContent = '';
    error.classList.remove('visible');
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
}

// Wyświetla komunikat o powodzeniu akcji
function showSuccessMessage({ response }) {
    if (!response) return;
    response.classList.add('visible');

    // Usuń poprzedni timeout jeśli istnieje
    const existingTimeoutId = response.dataset.timeoutId;
    if (existingTimeoutId) {
        clearTimeout(parseInt(existingTimeoutId, 10));
    }

    // Ustaw nowy timeout do ukrycia wiadomości
    const timeoutId = setTimeout(() => {
        response.classList.remove('visible');
        response.removeAttribute('data-timeout-id');
    }, 2800);

    response.dataset.timeoutId = timeoutId.toString();
}

// Sprawdza poprawność formatu adresu email
function isEmailCorrectFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
}

// Obsługuje wysłanie formularza subskrypcji
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

    // W wersji produkcyjnej zastąpić faktycznym wysłaniem API
    console.log("Form submitted with email:", email);
    input.value = '';
    showSuccessMessage(elements);
}

// Obsługuje zmiany w polu email (usuwa błąd podczas pisania)
function handleEmailInput(elements) {
    if (elements.input?.getAttribute('aria-invalid') === 'true') {
        clearError(elements);
    }
}

// Konfiguruje animację cząsteczek w tle
function setupParticles() {
    if (typeof tsParticles === 'undefined') return;

    tsParticles.load("tsparticles", {
        fpsLimit: 45,
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"] },
            shape: { type: "circle" },
            opacity: { value: { min: 0.1, max: 0.4 }, random: true, anim: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false } },
            size: { value: { min: 1, max: 3 }, random: true, anim: { enable: true, speed: 2, minimumValue: 0.5, sync: false } },
            links: { enable: true, distance: 130, color: "#00E8FF", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 0.8, direction: "none", random: true, straight: false, outModes: { default: "out" }, attract: { enable: false } }
        },
        interactivity: {
            detectsOn: "canvas",
            events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: false }, resize: { enable: true } },
            modes: { repulse: { distance: 100, duration: 0.4 } }
        },
        detectRetina: true,
        background: { color: "transparent" }
    }).catch(err => {
        console.error("Failed to load tsParticles:", err);
        const particlesElement = document.getElementById('tsparticles');
        if (particlesElement) particlesElement.style.display = 'none';
    });
}

// Ustawia działanie menu mobilnego
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = mobileMenu?.querySelectorAll('.mobile-menu-link');

    if (!mobileMenuButton || !closeMobileMenuButton || !mobileMenu || !mobileMenuLinks?.length) return;

    // Funkcja przełączająca widoczność menu
    const toggleMenu = (show) => {
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
    mobileMenuLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMenu(false);
        }
    });
}

// Ustawia aktualny rok w stopce
function setCurrentYear() {
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear().toString();
    }
}

// Inicjalizuje formularz subskrypcji
function initializeForm() {
    const form = document.getElementById("subscribe-form");
    const input = document.getElementById("emailaddress");
    const error = document.getElementById("email-error");
    const response = document.getElementById("responseMessage");

    if (!form || !input || !error || !response) return;

    const formElements = { form, input, error, response };
    form.addEventListener('submit', e => handleFormSubmit(e, formElements));
    input.addEventListener('input', () => handleEmailInput(formElements));
}

// Konfiguruje płynne przewijanie do sekcji po kliknięciu w linki
function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-link, .cta-btn[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId?.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

// Inicjalizuje wszystkie komponenty strony
function initialize() {
    initializeForm();
    setupParticles();
    setupMobileMenu();
    setCurrentYear();
    setupSmoothScroll();
}

// Uruchamia inicjalizację po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}