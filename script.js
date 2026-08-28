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
document.addEventListener("DOMContentLoaded", () => {
  // Your Firebase Database Address
  const firebaseConfig = {
    databaseURL: "https://philsa-30a66-default-rtdb.firebaseio.com"
  };

  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const searchBtn = document.getElementById("points-search-btn");
  const searchInput = document.getElementById("points-search-input");
  const resultsDiv = document.getElementById("search-results");

  if (!searchBtn || !searchInput || !resultsDiv) return;

  function performSearch() {
    if (typeof firebase === 'undefined') {
      resultsDiv.innerHTML = '<p style="color: #d9534f;">Firebase SDK failed to load. Please check your connection.</p>';
      return;
    }

    const rawInput = searchInput.value.trim();
    if (!rawInput) {
      resultsDiv.innerHTML = '<p style="color: var(--ink-soft);">Please enter a name to search.</p>';
      return;
    }

    const cleanedQuery = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    resultsDiv.innerHTML = '<p>Searching points database...</p>';

    const database = firebase.database();

    // Query root to safely support 'FALL2026', 'FALL2025', 'members', or root keys
    database.ref().once('value')
      .then((snapshot) => {
        const treeData = snapshot.val();
        resultsDiv.innerHTML = '';

        if (!treeData) {
          resultsDiv.innerHTML = '<p>No database records found.</p>';
          return;
        }

        // Auto-detect node structure
        const membersData = treeData.FALL2026 || treeData.FALL2025 || treeData.members || treeData;
        const memberKeys = Object.keys(membersData);

        const matchedKey = memberKeys.find(nameKey => {
          const cleanKey = nameKey.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanKey.includes(cleanedQuery) || cleanedQuery.includes(cleanKey);
        });

        if (!matchedKey) {
          resultsDiv.innerHTML = `<p style="color: #d9534f;">No member found matching "${rawInput}". Please check spelling and try again.</p>`;
          return;
        }

        const memberData = membersData[matchedKey];

        resultsDiv.innerHTML = `
          <div style="background: #fff; padding: 24px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; font-size: 1.25rem; color: var(--ink);">${matchedKey}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 16px;">
              <div><strong>Cultural:</strong> ${memberData.culturalPoints || 0}</div>
              <div><strong>Modern:</strong> ${memberData.modernPoints || 0}</div>
              <div><strong>General:</strong> ${memberData.generalPoints || 0}</div>
              <div><strong>Sports:</strong> ${memberData.sportsPoints || 0}</div>
              <div><strong>Philanthropy:</strong> ${memberData.philanthropyPoints || 0}</div>
              <div><strong>Fundraising:</strong> ${memberData.fundraisingPoints || 0}</div>
            </div>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">
            <div style="font-size: 1.1rem; color: var(--ink);">
              <strong>Total Points: ${memberData.totalPoints || 0}</strong>
            </div>
          </div>
        `;
      })
      .catch((error) => {
        console.error("Firebase Search Error:", error);
        resultsDiv.innerHTML = '<p style="color: #d9534f;">Error querying database. Check console for details.</p>';
      });
  }

  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  });
});
      });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('points-search-input');
  const searchBtn = document.getElementById('points-search-btn');
  const resultsDiv = document.getElementById('search-results');

  if (!searchBtn || !searchInput || !resultsDiv) return; // not on points.html

  // Replace with your actual config (same values used in firebaseConfig.js)
  const firebaseConfig = {
    apiKey: "AIzaSyDtBrMENtxSCtnQ5WV1an0cZ4_bNpzNc0s",
    authDomain: "https://www.gstatic.com/firebasejs/8.10.1/firebase-app-compat.js",
    databaseURL: "https://console.firebase.google.com/u/0/project/philsa-30a66/overview",
    projectId: "philsa-30a66",
    storageBucket: "philsa-30a66.appspot.com",
    messagingSenderId: "716320849415",
    appId: "1:716320849415:web:e65af3996da7005075f4a2"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();
  const SHEET_NAME = 'FALL2026';

  function checkQualifications(userInfo) {
    const { duesPaid, totalPoints, culturalPoints, philanthropyPoints, fundraisingPoints } = userInfo;

    if (duesPaid === 'No') {
      return { isangMahalQualified: 'Pay Dues', goodPhilQualified: 'Pay Dues' };
    }

    const isangMahalQualified =
      (totalPoints >= 24 && culturalPoints >= 6 && philanthropyPoints >= 3 && fundraisingPoints >= 2)
        ? 'Qualified' : 'Not Qualified';

    let goodPhilQualified = 'Not Qualified';
    if (duesPaid === 'Full Year' &&
        totalPoints >= 80 && culturalPoints >= 20 && philanthropyPoints >= 10 && fundraisingPoints >= 10) {
      goodPhilQualified = 'Qualified';
    }
    if (duesPaid === 'Spring Semester' &&
        totalPoints >= 60 && culturalPoints >= 10 && philanthropyPoints >= 5 && fundraisingPoints >= 5) {
      goodPhilQualified = 'Qualified';
    }

    return { isangMahalQualified, goodPhilQualified };
  }

  function renderResults(name, userInfo) {
    if (!userInfo) {
      resultsDiv.innerHTML = `<p class="points-alert">Member not found.</p>`;
      return;
    }

    const q = checkQualifications(userInfo);
    const duesLabel = userInfo.duesPaid === 'No'
      ? 'Not Paid'
      : userInfo.duesPaid === 'Spring Semester' ? 'Spring' : 'Full Year';

    resultsDiv.innerHTML = `
      <div class="points-card">
        <h3 class="points-card-title">${name}</h3>
        <p class="points-dues">Dues: <em>${duesLabel}</em></p>
        <div class="points-stats">
          <div class="points-stat"><span>Total</span><strong>${userInfo.totalPoints}</strong></div>
          <div class="points-stat"><span>Cultural</span><strong>${userInfo.culturalPoints}</strong></div>
          <div class="points-stat"><span>Modern</span><strong>${userInfo.modernPoints}</strong></div>
          <div class="points-stat"><span>Sports</span><strong>${userInfo.sportsPoints}</strong></div>
          <div class="points-stat"><span>Philanthropy</span><strong>${userInfo.philanthropyPoints}</strong></div>
          <div class="points-stat"><span>Fundraising</span><strong>${userInfo.fundraisingPoints}</strong></div>
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

    const formattedName = rawName.replace(/\s/g, '').toLowerCase();
    resultsDiv.innerHTML = `<p class="points-loading">Searching…</p>`;

    try {
      const snapshot = await database.ref(`${SHEET_NAME}/${formattedName}`).once('value');
      renderResults(rawName, snapshot.exists() ? snapshot.val() : null);
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
