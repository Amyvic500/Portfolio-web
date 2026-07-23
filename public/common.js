/* ==========================================
   Victoria Amarachi Philip — common.js
   Shared nav / scroll / UI behaviour for all pages
   ========================================== */

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {

  // ── NAVBAR SCROLL EFFECT ──
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar?.classList.add('scrolled');
      backToTop?.classList.add('visible');
    } else {
      navbar?.classList.remove('scrolled');
      backToTop?.classList.remove('visible');
    }
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
  });

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── MOBILE NAV ──
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.getElementById('navLinks');
  navToggle?.addEventListener('click', () => navLinksEl?.classList.toggle('open'));
  navLinksEl?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinksEl.classList.remove('open'));
  });

  // ── FADE IN OBSERVER ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.skill-category, .service-card, .project-card, .gallery-item, .stat, .contact-item, .learning-track').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ── SMOOTH SCROLL FOR ON-PAGE ANCHORS ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// Small helper for JSON fetches
async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: 'include',
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
