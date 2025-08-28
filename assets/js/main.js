'use strict';

// Wrap all code in an IIFE to avoid polluting the global scope
(function () {

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
            responseEl.classList.add('visible');
            timeoutId = setTimeout(() => {
                responseEl.classList.remove('visible');
                delete responseEl.dataset.timeoutId;
            }, this.SUCCESS_MESSAGE_TIMEOUT);
            responseEl.dataset.timeoutId = timeoutId;
        }
    };

    function isEmailCorrectFormat(email) {
        // Validate email format
        return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
    }

    async function handleFormSubmit(event, inputEl, errorEl, responseEl, submitBtn) {
        // Process form submission via fetch
        event.preventDefault();
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

        const originalText = submitBtn.querySelector('span')?.textContent || 'Request Access';
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        const btnSpan = submitBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = 'Submitting...';
        else submitBtn.textContent = 'Submitting...';

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
            });
            if (!response.ok) {
                let msg = response.statusText || `Error: ${response.status}`;
                try { msg = (await response.json()).message || msg; } catch { }
                throw new Error(msg);
            }
            inputEl.value = '';
            FormFeedback.showSuccessMessage(responseEl);
        } catch (error) {
            FormFeedback.displayError(error.message || 'Submission failed.', inputEl, errorEl);
            inputEl.focus();
        } finally {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            if (btnSpan) btnSpan.textContent = originalText;
            else submitBtn.textContent = originalText;
        }
    }

    function handleEmailInput(inputEl, errorEl) {
        // Remove error on new input
        if (inputEl.getAttribute('aria-invalid') === 'true') FormFeedback.clearError(inputEl, errorEl);
    }

    function initializeForm() {
        // Attach form event listeners
        const form = document.getElementById("subscribe-form");
        if (!form) return;
        const input = document.getElementById("emailaddress");
        const error = document.getElementById("email-error");
        const response = document.getElementById("responseMessage");
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!input || !error || !response || !submitBtn) return;
        form.setAttribute('novalidate', '');
        form.addEventListener('submit', e => handleFormSubmit(e, input, error, response, submitBtn));
        input.addEventListener('input', () => handleEmailInput(input, error));
    }

    function setupParticles() {
        // Initialize tsParticles background
        if (typeof tsParticles === 'undefined') {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const elem = document.getElementById('tsparticles'); 
            if (elem) elem.style.display = 'none';
            return;
        }

        // --- Restore Original Particle Configuration ---
        const particleConfig = {
            fpsLimit: 45, // Lower FPS limit for potentially better performance
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } }, // Slightly fewer particles
                color: { value: ["#00E8FF", "#FC109C", "#FFE80C", "#A52AFF"] }, // Miami colors
                shape: { type: "circle" },
                opacity: { value: { min: 0.1, max: 0.4 }, animation: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false } }, // Simplified animation syntax
                size: { value: { min: 1, max: 3 }, animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false } }, // Simplified animation syntax
                links: { enable: true, distance: 140, color: "#00E8FF", opacity: 0.15, width: 1 }, // Slightly adjusted links
                move: { enable: true, speed: 0.7, direction: "none", random: true, straight: false, outModes: { default: "out" }, attract: { enable: false } } // Slightly slower speed
            },
            interactivity: {
                detectsOn: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, links: { opacity: 0.4 } },
                    push: { particles_nb: 4 }
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

    function setupMobileMenu() {
        // Configure mobile menu toggle and focus trap
        const btn = document.getElementById('mobile-menu-button');
        const closeBtn = document.getElementById('close-mobile-menu');
        const menu = document.getElementById('mobile-menu');
        if (!btn || !closeBtn || !menu) return;
        let firstEl, lastEl;
        const updateEls = () => {
            const items = Array.from(menu.querySelectorAll('a[href], button:not([disabled])'));
            firstEl = items[0]; lastEl = items[items.length - 1];
        };
        const handleTrap = e => {
            if (e.key !== 'Tab' || !firstEl || !lastEl) return;
            if (e.shiftKey && document.activeElement === firstEl) { lastEl.focus(); e.preventDefault(); }
            else if (!e.shiftKey && document.activeElement === lastEl) { firstEl.focus(); e.preventDefault(); }
        };
        const toggle = show => {
            menu.classList.toggle('hidden', !show);
            btn.setAttribute('aria-expanded', show);
            document.body.classList.toggle('no-scroll', show);
            if (show) {
                updateEls();
                requestAnimationFrame(() => closeBtn.focus());
                menu.addEventListener('keydown', handleTrap);
            } else {
                menu.removeEventListener('keydown', handleTrap);
                btn.focus();
            }
        };
        btn.addEventListener('click', () => toggle(true));
        closeBtn.addEventListener('click', () => toggle(false));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) toggle(false); });
        const nav = menu.querySelector('nav');
        if (nav) nav.addEventListener('click', e => { if (e.target.closest('.mobile-menu-link')) toggle(false); });
    }

    function setCurrentYear() {
        // Set footer year dynamically
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    }

      function setupScrollReveal() {
          // Reveal sections on scroll
        const sections = document.querySelectorAll('.section');
        if (!('IntersectionObserver' in window) || sections.length === 0) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(section => {
            section.classList.add('reveal');
            observer.observe(section);
        });
      }

      function setupCommandSlider() {
          // Auto-rotating voice command slider
          const slider = document.querySelector('.command-slider');
          if (!slider) return;
          const slides = slider.querySelectorAll('.command-slide');
          if (slides.length === 0) return;
          const prevBtn = slider.querySelector('.slider-btn.prev');
          const nextBtn = slider.querySelector('.slider-btn.next');
          let index = 0;

          const show = i => {
              slides[index].classList.remove('is-active');
              index = (i + slides.length) % slides.length;
              slides[index].classList.add('is-active');
          };

          const next = () => show(index + 1);
          const prev = () => show(index - 1);

          if (prevBtn) prevBtn.addEventListener('click', prev);
          if (nextBtn) nextBtn.addEventListener('click', next);

          let rotateInterval = null;
          if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              rotateInterval = setInterval(next, 5000);
              slider.addEventListener('mouseenter', () => { if (rotateInterval) { clearInterval(rotateInterval); rotateInterval = null; } });
              slider.addEventListener('mouseleave', () => { if (!rotateInterval) rotateInterval = setInterval(next, 5000); });
          }
      }

      function setupTiltCards() {
          // Interactive tilt effect for feature cards
          const cards = document.querySelectorAll('.feature-item');
          if (cards.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

          cards.forEach(card => {
              card.addEventListener('mousemove', e => {
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left - rect.width / 2;
                  const y = e.clientY - rect.top - rect.height / 2;
                  const rotateX = (-y / rect.height) * 8;
                  const rotateY = (x / rect.width) * 8;
                  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
              });
              card.addEventListener('mouseleave', () => {
                  card.style.transform = '';
              });
          });
      }

      function initialize() {
          initializeForm();
          setupParticles(); // Using the original config now
          setupMobileMenu();
          setupScrollReveal();
          setupCommandSlider();
          setupTiltCards();
          setCurrentYear();
          // setupSmoothScroll(); // Keep commented out for now
      }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();