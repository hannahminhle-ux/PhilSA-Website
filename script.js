// ---------------- Mobile nav toggle ----------------
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------------- Scroll-reveal for sections ----------------
const revealTargets = document.querySelectorAll(
  '.mission-list li, .event-card, .culture-copy, .culture-visual, .join-inner > *'
);

revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealTargets.forEach(el => revealObserver.observe(el));

// ---------------- Hero sunburst reacts gently to scroll ----------------
const heroRays = document.getElementById('hero-rays');

if (heroRays) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroRays.style.opacity = Math.max(0, 1 - y / 500);
  }, { passive: true });
}

// ---------------- Join form (front-end only demo) ----------------
const joinForm = document.getElementById('join-form');
const formNote = document.getElementById('form-note');

if (joinForm) {
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = joinForm.querySelector('#name').value.trim();

    formNote.textContent = name
      ? `Maraming salamat, ${name}! We'll follow up at the email you gave us.`
      : `Thanks for reaching out — we'll be in touch soon.`;

    joinForm.reset();
  });
}

// ---------------- Hero slideshow ----------------
(function(){
  const track = document.getElementById('slideshow-track');
  if(!track) return;

  const slides = track.querySelectorAll('.slide');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  const pauseBtn = document.getElementById('slide-pause');
  const dotsWrap = document.getElementById('slide-dots');

  let current = 0;
  let isPlaying = true;
  let timer = null;
  const INTERVAL = 4000;

  const pauseIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <rect x="6" y="5" width="4" height="14"/>
    <rect x="14" y="5" width="4" height="14"/>
  </svg>`;

  const playIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M7 5l12 7-12 7V5z"/>
  </svg>`;

  // build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slide-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.slide-dot');

  function update(){
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(index){
    current = (index + slides.length) % slides.length;
    update();
  }

  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  function startAutoplay(){
    stopAutoplay();
    timer = setInterval(next, INTERVAL);
  }

  function stopAutoplay(){
    if(timer) clearInterval(timer);
    timer = null;
  }

  nextBtn.addEventListener('click', () => { next(); if(isPlaying) startAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); if(isPlaying) startAutoplay(); });

  pauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    pauseBtn.querySelector('.slide-pause-icon').innerHTML = isPlaying ? pauseIcon : playIcon;
    pauseBtn.setAttribute('aria-label', isPlaying ? 'Pause slideshow' : 'Play slideshow');
    if(isPlaying){ startAutoplay(); } else { stopAutoplay(); }
  });

  update();
  startAutoplay();
})();

// ---------------- Nav dropdown ----------------
document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
  const toggle = dropdown.querySelector('.nav-dropdown-toggle');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close this dropdown's links when clicked (mirrors your existing mainNav link behavior)
  dropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dropdown.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
});

// Close dropdown when clicking anywhere outside it
document.addEventListener('click', (e) => {
  document.querySelectorAll('.nav-dropdown.is-open').forEach(dropdown => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    }
  });
});