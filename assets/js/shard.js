document.getElementById('current-year').textContent = new Date().getFullYear();

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

const voiceSlider = document.querySelector('.voice-slider');
if (voiceSlider) {
  const cards = voiceSlider.querySelectorAll('.voice-card');
  const nextBtn = voiceSlider.querySelector('.next');
  const prevBtn = voiceSlider.querySelector('.prev');
  let index = 0;
  const show = i => {
    cards.forEach((card, idx) => {
      card.classList.toggle('active', idx === i);
    });
  };
  const next = () => {
    index = (index + 1) % cards.length;
    show(index);
  };
  const prev = () => {
    index = (index - 1 + cards.length) % cards.length;
    show(index);
  };
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  let auto = setInterval(next, 5000);
  voiceSlider.addEventListener('mouseenter', () => clearInterval(auto));
  voiceSlider.addEventListener('mouseleave', () => auto = setInterval(next, 5000));
  show(index);
}
