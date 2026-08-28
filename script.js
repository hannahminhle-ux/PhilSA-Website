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
// ---------------- Firebase Points Live Search ----------------
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('points-search-input');
  const searchBtn = document.getElementById('points-search-btn');
  const resultsDiv = document.getElementById('search-results');

  if (!searchBtn || !searchInput || !resultsDiv) return;

  // 1. Initialize Firebase App
  const firebaseConfig = {
    apiKey: "AIzaSyDtBrMENtxSCtnQ5WV1an0cZ4_bNpzNc0s",
    authDomain: "philsa-30a66.firebaseapp.com",
    databaseURL: "https://philsa-30a66-default-rtdb.firebaseio.com",
    projectId: "philsa-30a66",
    storageBucket: "philsa-30a66.appspot.com",
    messagingSenderId: "716320849415",
    appId: "1:716320849415:web:e65af3996da7005075f4a2",
    measurementId: "G-4PGYLF4BYV"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();

function checkQualifications(userInfo) {
  const { duesPaid, total, cultural, philanthropy, fundraising } = userInfo;
  if (duesPaid === 'No' || !duesPaid) {
    return { isangMahalQualified: 'Pay Dues', goodPhilQualified: 'Pay Dues' };
  }

  const tPoints = Number(total) || 0;
  const cPoints = Number(cultural) || 0;
  const pPoints = Number(philanthropy) || 0;
  const fPoints = Number(fundraising) || 0;

    const isangMahalQualified = (tPoints >= 24 && cPoints >= 6 && pPoints >= 3 && fPoints >= 2) ? 'Qualified' : 'Not Qualified';

    let goodPhilQualified = 'Not Qualified';
    if (duesPaid === 'Full Year' && tPoints >= 80 && cPoints >= 20 && pPoints >= 10 && fPoints >= 10) {
      goodPhilQualified = 'Qualified';
    }
    if ((duesPaid === 'Spring Semester' || duesPaid === 'Half Year') && tPoints >= 60 && cPoints >= 10 && pPoints >= 5 && fPoints >= 5) {
      goodPhilQualified = 'Qualified';
    }

    return { isangMahalQualified, goodPhilQualified };
  }

  function renderResults(name, userInfo) {
    if (!userInfo) {
      resultsDiv.innerHTML = `<p class="points-alert">Member not found. Check spelling or view full points sheet below.</p>`;
      return;
    }

    const q = checkQualifications(userInfo);
    const duesLabel = userInfo.duesPaid === 'No' ? 'Not Paid' : (userInfo.duesPaid || 'N/A');

    resultsDiv.innerHTML = `
      <div class="points-card">
        <h3 class="points-card-title">${userInfo.name || name}</h3>
        <p class="points-dues">Dues: <em>${duesLabel}</em></p>
<div class="points-stats">
  <div class="points-stat"><span>Total</span><strong>${userInfo.total || 0}</strong></div>
  <div class="points-stat"><span>Cultural</span><strong>${userInfo.cultural || 0}</strong></div>
  <div class="points-stat"><span>Modern</span><strong>${userInfo.modern || 0}</strong></div>
  <div class="points-stat"><span>Sports</span><strong>${userInfo.sports || 0}</strong></div>
  <div class="points-stat"><span>Philanthropy</span><strong>${userInfo.philanthropy || 0}</strong></div>
  <div class="points-stat"><span>Fundraising</span><strong>${userInfo.fundraising || 0}</strong></div>
</div>
        <div class="points-qual-row">
          <div class="points-qual ${q.isangMahalQualified === 'Qualified' ? 'is-qualified' : ''}">
            <span>Isang Mahal</span><strong>${q.isangMahalQualified}</strong>
          </div>
          <div class="points-qual ${q.goodPhilQualified === 'Qualified' ? 'is-qualified' : ''}">
            <span>Goodphil</span><strong>${q.goodPhilQualified}</strong>
          </div>
        </div>
      </div>
    `;
  }

  async function handleSearch() {
    const rawName = searchInput.value.trim();
    if (!rawName) {
      resultsDiv.innerHTML = `<p class="points-alert">Please enter your name.</p>`;
      return;
    }

    const searchTarget = rawName.toLowerCase();
    const formattedKey = rawName.replace(/\s/g, '').toLowerCase();
    resultsDiv.innerHTML = `<p class="points-loading">Searching…</p>`;

    try {
      // 1. Try direct exact match key lookup (e.g., FALL2026/johnsmith)
      let snapshot = await database.ref(`FALL2026/${formattedKey}`).once('value');

      if (snapshot.exists()) {
        renderResults(rawName, snapshot.val());
        return;
      }

      // 2. Fallback: Search across all nodes in FALL2026 (case-insensitive partial search)
      const rootSnapshot = await database.ref('FALL2026').once('value');
      if (rootSnapshot.exists()) {
        let matchedData = null;
        rootSnapshot.forEach((childSnapshot) => {
          const val = childSnapshot.val();
          const memberName = (val.name || childSnapshot.key || "").toLowerCase();
          if (memberName.includes(searchTarget) || searchTarget.includes(memberName)) {
            matchedData = val;
          }
        });

        if (matchedData) {
          renderResults(rawName, matchedData);
          return;
        }
      }

      // If no records match
      renderResults(rawName, null);
    } catch (err) {
      console.error('Error fetching user:', err);
      resultsDiv.innerHTML = `<p class="points-alert">Error fetching your information.</p>`;
    }
  }

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
});
