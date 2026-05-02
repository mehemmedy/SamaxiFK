/* ============================================================
   Şamaxı FK — Ana JavaScript Faylı (Təmizlənmiş)
   ============================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getPositionClass(pos) {
  if (pos === 'Qapıçı') return 'pos-gk';
  if (pos === 'Müdafiəçi') return 'pos-def';
  if (pos === 'Yarımmüdafiəçi') return 'pos-mid';
  return 'pos-fwd';
}

function getMatchResult(match) {
  if (match.status !== 'tamamlandı') return 'upcoming';
  const isHome = match.home === 'Şamaxı FK';
  const sf = isHome ? match.score_home : match.score_away;
  const oe = isHome ? match.score_away : match.score_home;
  if (sf > oe) return 'win';
  if (sf < oe) return 'loss';
  return 'draw';
}

function getResultLabel(result) {
  const map = { win: 'Qələbə', loss: 'Məğlubiyyət', draw: 'Bərabərlik', upcoming: 'Gözlənilir' };
  return map[result] || 'Gözlənilir';
}

async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Məlumat yüklənmədi (${path}):`, err);
    return null;
  }
}

function createPlayerCard(player) {
  const posClass = getPositionClass(player.position);
  return `
    <div class="col-6 col-md-4 col-lg-3 player-item" data-position="${player.position}">
      <div class="player-card">
        <div class="player-img-wrap">
          <span class="player-number-bg">${player.number}</span>
          <img src="${player.image}" alt="${player.name}" class="player-avatar" loading="lazy">
          <div class="player-number-badge">${player.number}</div>
        </div>
        <div class="player-info">
          <div class="player-name">${player.name}</div>
          <div class="player-position">
            <span class="player-position-dot ${posClass}"></span>
            ${player.position}
          </div>
        </div>
        <div class="player-footer">
          <span class="player-nat">${player.nationality}</span>
          <span class="player-age">${player.age} yaş</span>
        </div>
      </div>
    </div>`;
}

function createMatchCard(match, compact = false) {
  const result = getMatchResult(match);
  const label = getResultLabel(result);
  const isUpcoming = match.status !== 'tamamlandı';

  const scoreHtml = isUpcoming
    ? `<div class="match-score upcoming-score">VS</div>`
    : `<div class="match-score">${match.score_home} : ${match.score_away}</div>`;

  const statusClass = `status-${result}`;

  if (compact) {
    return `
      <div class="match-card ${result} mb-3 h-100">
        <div class="match-competition">${match.competition}</div>
        <div class="match-teams">
          <div class="match-team"><div class="match-team-name">${match.home}</div></div>
          ${scoreHtml}
          <div class="match-team"><div class="match-team-name">${match.away}</div></div>
        </div>
        <div class="match-meta">
          <span class="match-date">📅 ${formatDate(match.date)}</span>
          <span class="status-badge ${statusClass}">${label}</span>
        </div>
      </div>`;
  }

  return `
    <div class="col-md-6 col-xl-4 match-item" data-status="${match.status}">
      <div class="match-card ${result} h-100">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <span class="match-competition">${match.competition}</span>
          <span class="status-badge ${statusClass}">${label}</span>
        </div>
        <div class="match-teams">
          <div class="match-team"><div class="match-team-name">${match.home}</div></div>
          ${scoreHtml}
          <div class="match-team"><div class="match-team-name">${match.away}</div></div>
        </div>
        <div class="match-meta">
          <span class="match-date">📅 ${formatDate(match.date)} — ${match.time}</span>
          <span class="match-venue">🏟 ${match.venue}</span>
        </div>
      </div>
    </div>`;
}

async function initTeamPage() {
  const gridEl = $('#players-grid');
  if (!gridEl) return;

  const players = await fetchJSON('data/players.json');
  if (!players) return;

  gridEl.innerHTML = players.length
    ? players.map(p => createPlayerCard(p)).join('')
    : `<div class="col-12 text-center py-5 text-muted-c">Oyunçu tapılmadı.</div>`;
}

async function initMatchesPage() {
  const gridEl = $('#matches-grid');
  if (!gridEl) return;

  const matches = await fetchJSON('data/matches.json');
  if (!matches) return;

  gridEl.innerHTML = matches.length
    ? matches.map(m => createMatchCard(m)).join('')
    : `<div class="col-12 text-center py-5 text-muted-c">Oyun tapılmadı.</div>`;
}

/* ── Navbar Hamburger Toggle ── */
function initNavToggle() {
  const toggler = document.getElementById('navToggler');
  const menu    = document.getElementById('navMenu');
  if (!toggler || !menu) return;

  toggler.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!toggler.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.navbar-nav .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === page) link.classList.add('active');
    if (page === '' && link.getAttribute('href') === 'index.html') link.classList.add('active');
  });
}

function initNavScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 50
      ? '0 4px 30px rgba(0,0,0,0.6)'
      : 'none';
  }, { passive: true });
}

function initScrollAnimations() {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.card-glass, .match-card, .player-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initNavScroll();
  initNavToggle();

  const page = document.body.dataset.page;

  if (page === 'team')    initTeamPage();
  if (page === 'matches') initMatchesPage();

  setTimeout(initScrollAnimations, 300);
});