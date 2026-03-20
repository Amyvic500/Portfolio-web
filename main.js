/* ==========================================
   VICTORIA AMARACHI PHILIP — main.js
   All interactive functionality
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAVBAR ──
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

    // Update active nav on scroll
    const sections = document.querySelectorAll('section[id], div[id]');
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
  navToggle?.addEventListener('click', () => {
    navLinksEl?.classList.toggle('open');
  });
  navLinksEl?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinksEl.classList.remove('open'));
  });

  // ── FADE IN OBSERVER ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.skill-category, .service-card, .project-card, .gallery-item, .stat, .contact-item').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ── SMOOTH SCROLL ──
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

  // ── FILTER BUTTONS ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.filter-bar') || btn.parentElement;
      group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const container = document.getElementById('projectsGrid') || document.getElementById('galleryGrid');
      if (!container) return;

      const items = container.querySelectorAll('[data-category], [data-project], [data-type]');
      items.forEach(item => {
        const cat = item.dataset.category || item.dataset.project || item.dataset.type;
        const match = filter === 'all' || cat === filter || item.dataset.project === filter || item.dataset.type === filter;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  // ── CONTACT FORM ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const btn = document.getElementById('submitBtn');
      const text = document.getElementById('submitText');
      const loader = document.getElementById('submitLoader');
      const success = document.getElementById('formSuccess');
      const error = document.getElementById('formError');

      text.style.display = 'none';
      loader.style.display = 'flex';
      btn.disabled = true;
      success.style.display = 'none';
      error.style.display = 'none';

      // Simulate form submission (replace with real endpoint)
      await new Promise(r => setTimeout(r, 1800));

      text.style.display = 'flex';
      loader.style.display = 'none';
      btn.disabled = false;

      // 90% success simulation
      if (Math.random() > 0.05) {
        success.style.display = 'flex';
        contactForm.reset();
        // Real implementation: use Formspree, EmailJS, or backend API
        // await fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', body: new FormData(contactForm) })
      } else {
        error.style.display = 'flex';
      }
    });

    // Real-time validation
    ['fullName','email','subject','message'].forEach(id => {
      document.getElementById(id)?.addEventListener('blur', () => validateField(id));
      document.getElementById(id)?.addEventListener('input', () => clearError(id));
    });
  }

  function validateForm() {
    let valid = true;
    const name = document.getElementById('fullName');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    const consent = document.getElementById('consent');

    if (!name?.value.trim()) { showError('fullName', 'nameError', 'Name is required'); valid = false; }
    if (!email?.value.trim() || !/^\S+@\S+\.\S+$/.test(email.value)) { showError('email', 'emailError', 'Valid email required'); valid = false; }
    if (!subject?.value) { showError('subject', 'subjectError', 'Please select a subject'); valid = false; }
    if (!message?.value.trim() || message.value.length < 20) { showError('message', 'messageError', 'Message must be at least 20 characters'); valid = false; }
    if (!consent?.checked) { document.getElementById('consentError').textContent = 'Please agree to be contacted'; valid = false; }

    return valid;
  }

  function showError(fieldId, errorId, msg) {
    document.getElementById(fieldId)?.classList.add('error');
    const el = document.getElementById(errorId);
    if (el) el.textContent = msg;
  }

  function clearError(fieldId) {
    document.getElementById(fieldId)?.classList.remove('error');
  }

  function validateField(id) {
    const el = document.getElementById(id);
    if (!el?.value.trim()) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }
  }

  // ── CV UPLOAD ──
  const cvInput = document.getElementById('cvFileInput');
  const cvFeedback = document.getElementById('cvUploadFeedback');
  if (cvInput) {
    cvInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const validTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        showFeedback(cvFeedback, '❌ Invalid file type. Please upload PDF or Word document.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showFeedback(cvFeedback, '❌ File too large. Maximum 5MB.', 'error');
        return;
      }
      // Store in localStorage for demo (in production, upload to server)
      const reader = new FileReader();
      reader.onload = () => {
        try {
          localStorage.setItem('portfolio_cv_name', file.name);
          localStorage.setItem('portfolio_cv_data', reader.result);
          showFeedback(cvFeedback, `✅ CV "${file.name}" uploaded successfully!`, 'success');
          document.getElementById('cvDownloadBtn').href = reader.result;
          document.getElementById('cvDownloadBtn').download = file.name;
        } catch {
          showFeedback(cvFeedback, '✅ CV ready for download.', 'success');
        }
      };
      reader.readAsDataURL(file);
    });
    // Drag-drop on CV area
    const cvArea = document.getElementById('cvUploadArea');
    cvArea?.addEventListener('dragover', e => { e.preventDefault(); cvArea.style.borderColor = 'var(--gold)'; });
    cvArea?.addEventListener('dragleave', () => { cvArea.style.borderColor = ''; });
    cvArea?.addEventListener('drop', e => {
      e.preventDefault();
      cvArea.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file) { const dt = new DataTransfer(); dt.items.add(file); cvInput.files = dt.files; cvInput.dispatchEvent(new Event('change')); }
    });
    // Load saved CV
    try {
      const savedName = localStorage.getItem('portfolio_cv_name');
      const savedData = localStorage.getItem('portfolio_cv_data');
      if (savedName && savedData) {
        const btn = document.getElementById('cvDownloadBtn');
        if (btn) { btn.href = savedData; btn.download = savedName; }
      }
    } catch {}
  }

  function showFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = type === 'success' ? 'rgba(0,201,167,.1)' : 'rgba(224,85,85,.1)';
    el.style.borderColor = type === 'success' ? 'rgba(0,201,167,.3)' : 'rgba(224,85,85,.3)';
    el.style.color = type === 'success' ? 'var(--accent)' : 'var(--red)';
  }

  // ── MEDIA UPLOAD ──
  const mediaInput = document.getElementById('mediaFileInput');
  const dropZone = document.getElementById('dropZone');
  const uploadMeta = document.getElementById('uploadMetaForm');
  let pendingFiles = [];

  if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
    dropZone.addEventListener('click', e => {
      if (e.target !== document.getElementById('mediaFileInput') && !e.target.closest('button')) {
        mediaInput?.click();
      }
    });
  }

  mediaInput?.addEventListener('change', e => handleFiles(e.target.files));

  function handleFiles(files) {
    pendingFiles = Array.from(files);
    if (!pendingFiles.length) return;

    const previews = document.getElementById('uploadPreviews');
    if (previews) {
      previews.innerHTML = '';
      pendingFiles.forEach(file => {
        const wrap = document.createElement('div');
        wrap.className = 'preview-item';
        if (file.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          wrap.appendChild(img);
        } else {
          wrap.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--dark-2);font-size:.7rem;color:var(--muted);text-align:center;padding:.2rem">${file.name.slice(0,18)}</div>`;
        }
        const rem = document.createElement('button');
        rem.className = 'remove-preview';
        rem.innerHTML = '×';
        rem.onclick = () => wrap.remove();
        wrap.appendChild(rem);
        previews.appendChild(wrap);
      });
    }
    uploadMeta && (uploadMeta.style.display = 'block');
    dropZone && (dropZone.style.display = 'none');
  }

  window.saveUpload = function() {
    const project = document.getElementById('uploadProject')?.value || 'other';
    const caption = document.getElementById('uploadCaption')?.value || 'Project Media';

    pendingFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        addGalleryItem({
          src: reader.result,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          project,
          caption,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    });

    cancelUpload();
  };

  window.cancelUpload = function() {
    uploadMeta && (uploadMeta.style.display = 'none');
    dropZone && (dropZone.style.display = 'block');
    mediaInput && (mediaInput.value = '');
    pendingFiles = [];
  };

  function addGalleryItem({ src, type, project, caption }) {
    const grid = document.getElementById('galleryGrid');
    const empty = document.getElementById('galleryEmpty');
    if (!grid) return;

    const item = document.createElement('div');
    item.className = 'gallery-item fade-in';
    item.dataset.type = type;
    item.dataset.project = project;

    const media = document.createElement('div');
    media.className = 'gallery-media';
    if (type === 'image') {
      const img = document.createElement('img');
      img.src = src; img.alt = caption; img.loading = 'lazy';
      media.appendChild(img);
    } else {
      const vid = document.createElement('video');
      vid.src = src; vid.muted = true; vid.loop = true;
      media.appendChild(vid);
    }

    item.innerHTML = `
      <div class="gallery-overlay">
        <span class="gallery-title">${caption}</span>
        <span class="gallery-project">${project}</span>
        <button class="gallery-view-btn" onclick="openLightbox(this)">
          <i class="fas fa-${type === 'video' ? 'play' : 'expand-alt'}"></i>
        </button>
      </div>
      <button class="gallery-delete" onclick="deleteGalleryItem(this)" title="Remove"><i class="fas fa-trash"></i></button>
    `;
    item.prepend(media);
    grid.prepend(item);
    if (empty) empty.style.display = 'none';
    setTimeout(() => item.classList.add('visible'), 50);

    // Save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
      stored.unshift({ src, type, project, caption });
      localStorage.setItem('portfolio_gallery', JSON.stringify(stored.slice(0, 30)));
    } catch {}
  }

  window.deleteGalleryItem = function(btn) {
    const item = btn.closest('.gallery-item');
    item.style.opacity = '0'; item.style.transform = 'scale(0.8)';
    setTimeout(() => { item.remove(); checkGalleryEmpty(); }, 300);
  };

  function checkGalleryEmpty() {
    const grid = document.getElementById('galleryGrid');
    const empty = document.getElementById('galleryEmpty');
    if (grid && empty) {
      const visible = grid.querySelectorAll('.gallery-item');
      empty.style.display = visible.length === 0 ? 'block' : 'none';
    }
  }

  // Load saved gallery
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
    saved.forEach(item => addGalleryItem(item));
  } catch {}

  // ── LIGHTBOX ──
  let lightboxItems = [];
  let lightboxIndex = 0;

  window.openLightbox = function(btn) {
    const item = btn.closest('.gallery-item');
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    lightboxItems = Array.from(grid.querySelectorAll('.gallery-item')).filter(i => i.style.display !== 'none');
    lightboxIndex = lightboxItems.indexOf(item);
    renderLightbox();
  };

  function renderLightbox() {
    const lb = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const info = document.getElementById('lightboxInfo');
    if (!lb || !content) return;

    const item = lightboxItems[lightboxIndex];
    if (!item) return;

    const mediaEl = item.querySelector('img, video');
    const title = item.querySelector('.gallery-title')?.textContent || '';
    const proj = item.querySelector('.gallery-project')?.textContent || '';

    content.innerHTML = '';
    if (mediaEl) {
      const clone = mediaEl.cloneNode(true);
      if (clone.tagName === 'VIDEO') { clone.controls = true; clone.autoplay = true; }
      content.appendChild(clone);
    } else {
      const icon = item.querySelector('.img-placeholder i, .vid-placeholder i');
      content.innerHTML = `<div style="text-align:center;padding:3rem"><i class="${icon?.className || 'fas fa-image'}" style="font-size:5rem;color:var(--gold)"></i><p style="color:var(--muted);margin-top:1rem">${title}</p></div>`;
    }

    if (info) info.innerHTML = `<span><strong style="color:var(--gold)">${proj}</strong> — ${title} (${lightboxIndex+1}/${lightboxItems.length})</span>`;
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  window.closeLightbox = function(e) {
    if (e && e.target !== document.getElementById('lightbox') && !e.target.closest('.lightbox-close')) return;
    const lb = document.getElementById('lightbox');
    if (lb) lb.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.lightboxNav = function(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  };

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb?.style.display !== 'none') {
      if (e.key === 'Escape') { lb.style.display = 'none'; document.body.style.overflow = ''; }
      if (e.key === 'ArrowLeft') window.lightboxNav(-1);
      if (e.key === 'ArrowRight') window.lightboxNav(1);
    }
  });

  // ── MODAL (for project media on projects page) ──
  window.openMediaModal = function(projectId) {
    const modal = document.getElementById('mediaModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    if (!modal) return;

    const projects = {
      carequeue: {
        title: 'CareQueue — Media',
        html: `<p style="color:var(--muted);margin-bottom:1rem">Upload and view screenshots, demo videos, and documentation for the CareQueue project.</p>
        <div style="border:1px dashed var(--mid);border-radius:var(--radius);padding:2rem;text-align:center;color:var(--muted)">
          <i class="fas fa-images" style="font-size:2rem;color:var(--gold);display:block;margin-bottom:.75rem"></i>
          <p>No media uploaded yet.</p>
          <a href="media.html" class="btn-primary" style="display:inline-flex;margin-top:1rem"><i class="fas fa-upload"></i> Go to Media Gallery</a>
        </div>`
      }
    };

    const p = projects[projectId] || { title: 'Project Media', html: '<p>No media available.</p>' };
    if (title) title.textContent = p.title;
    if (content) content.innerHTML = p.html;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function(e) {
    const modal = document.getElementById('mediaModal');
    if (e && e.target !== modal) return;
    modal && (modal.style.display = 'none');
    document.body.style.overflow = '';
  };

  window.closeMediaModal = function() {
    const modal = document.getElementById('mediaModal');
    modal && (modal.style.display = 'none');
    document.body.style.overflow = '';
  };

  // ── PROJECTS: Add New ──
  window.toggleAddProjectForm = function() {
    const form = document.getElementById('addProjectForm');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
  };

  window.addNewProject = function() {
    const title = document.getElementById('newTitle')?.value.trim();
    const cat = document.getElementById('newCategory')?.value;
    const desc = document.getElementById('newDesc')?.value.trim();
    const stack = document.getElementById('newStack')?.value.trim();
    const outcomes = document.getElementById('newOutcomes')?.value.trim();
    const github = document.getElementById('newGithub')?.value.trim();
    const demo = document.getElementById('newDemo')?.value.trim();

    if (!title || !cat || !desc) { alert('Please fill in title, category, and description.'); return; }

    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const stackTags = stack ? stack.split(',').map(s => `<span>${s.trim()}</span>`).join('') : '';
    const outcomeItems = outcomes ? outcomes.split('\n').map(o => `<div class="outcome-item"><i class="fas fa-check"></i> ${o.trim()}</div>`).join('') : '';
    const links = (github || demo) ? `<div class="project-links">${github ? `<a href="${github}" class="project-link" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}${demo ? `<a href="${demo}" class="project-link primary" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}</div>` : '';

    const card = document.createElement('div');
    card.className = 'project-card fade-in';
    card.dataset.category = cat;
    card.innerHTML = `
      <div class="project-card-header">
        <div class="project-icon" style="background:linear-gradient(135deg,var(--gold),#a07028)"><i class="fas fa-code"></i></div>
        <div class="project-category-tag">${cat}</div>
      </div>
      <h3 class="project-title">${title}</h3>
      <p class="project-desc">${desc}</p>
      ${stackTags ? `<div class="project-stack">${stackTags}</div>` : ''}
      ${outcomeItems ? `<div class="project-outcomes">${outcomeItems}</div>` : ''}
      ${links}
    `;
    grid.prepend(card);
    setTimeout(() => card.classList.add('visible'), 50);
    toggleAddProjectForm();

    // Reset form
    ['newTitle','newCategory','newDesc','newStack','newOutcomes','newGithub','newDemo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    // Save to localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
      saved.push({ title, cat, desc, stack, outcomes, github, demo });
      localStorage.setItem('portfolio_projects', JSON.stringify(saved));
    } catch {}
  };

  // Load saved projects
  try {
    const savedProjects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
    savedProjects.forEach(p => {
      const e = { preventDefault: () => {} };
      document.getElementById('newTitle').value = p.title;
      document.getElementById('newCategory').value = p.cat;
      document.getElementById('newDesc').value = p.desc;
      document.getElementById('newStack').value = p.stack;
      document.getElementById('newOutcomes').value = p.outcomes;
      document.getElementById('newGithub').value = p.github;
      document.getElementById('newDemo').value = p.demo;
      window.addNewProject();
    });
  } catch {}

  // ── CV DOWNLOAD ──
  window.handleCVDownload = function(e) {
    try {
      const saved = localStorage.getItem('portfolio_cv_data');
      if (!saved) {
        e.preventDefault();
        alert('No CV has been uploaded yet. Please upload your CV first using the upload area above.');
      }
    } catch {}
  };

});

/* ==========================================
   NEW FEATURES — Learning, Testimonials,
   Blog, WhatsApp
   ========================================== */

// ── PROGRESS BARS ANIMATION ──
(function animateProgressBars() {
  const bars = document.querySelectorAll('.progress-bar[data-pct]');
  if (!bars.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct = entry.target.dataset.pct;
        const fill = entry.target.querySelector('.progress-fill');
        if (fill) fill.style.width = pct + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => obs.observe(b));
})();

// ── TESTIMONIALS SLIDER ──
let testiIndex = 0;
const testiCards = document.querySelectorAll('.testimonial-card');
const testiDots = document.querySelectorAll('.testi-dot');
let testiAuto;

function updateTestimonials() {
  testiCards.forEach((c, i) => c.classList.toggle('active', i === testiIndex));
  testiDots.forEach((d, i) => d.classList.toggle('active', i === testiIndex));
}

window.testimonialsNav = function(dir) {
  testiIndex = (testiIndex + dir + testiCards.length) % testiCards.length;
  updateTestimonials();
  resetTestiAuto();
};

window.testimonialsGoto = function(i) {
  testiIndex = i;
  updateTestimonials();
  resetTestiAuto();
};

function resetTestiAuto() {
  clearInterval(testiAuto);
  testiAuto = setInterval(() => {
    testiIndex = (testiIndex + 1) % testiCards.length;
    updateTestimonials();
  }, 6000);
}

if (testiCards.length) resetTestiAuto();

// ── TESTIMONIAL FORM ──
let selectedStars = 5;

window.toggleTestimonialForm = function() {
  const form = document.getElementById('addTestimonialForm');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

(function initStarRating() {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = +star.dataset.val;
      stars.forEach(s => s.classList.toggle('hover', +s.dataset.val <= val));
    });
    star.addEventListener('mouseout', () => stars.forEach(s => s.classList.remove('hover')));
    star.addEventListener('click', () => {
      selectedStars = +star.dataset.val;
      stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= selectedStars));
    });
  });
  // Default all active
  stars.forEach(s => s.classList.add('active'));
})();

window.submitTestimonial = function() {
  const name = document.getElementById('testiName')?.value.trim();
  const role = document.getElementById('testiRole')?.value.trim() || 'Portfolio Visitor';
  const text = document.getElementById('testiText')?.value.trim();

  if (!name || !text) { alert('Please fill in your name and message.'); return; }
  if (text.length < 20) { alert('Message must be at least 20 characters.'); return; }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const starsHtml = '&#9733;'.repeat(selectedStars) + '&#9734;'.repeat(5 - selectedStars);

  const slider = document.getElementById('testimonialsSlider');
  const dots = document.getElementById('testiDots');

  const card = document.createElement('div');
  card.className = 'testimonial-card';
  card.innerHTML = `
    <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
    <p class="testimonial-text">${text}</p>
    <div class="testimonial-author">
      <div class="author-avatar">${initials}</div>
      <div><strong>${name}</strong><span>${role}</span></div>
      <div class="testimonial-stars">${starsHtml}</div>
    </div>
  `;
  slider?.appendChild(card);

  const dot = document.createElement('span');
  dot.className = 'testi-dot';
  const allDots = dots?.querySelectorAll('.testi-dot');
  const newIdx = allDots ? allDots.length : 0;
  dot.onclick = () => window.testimonialsGoto(newIdx);
  dots?.appendChild(dot);

  // Go to new testimonial
  window.testimonialsGoto(document.querySelectorAll('.testimonial-card').length - 1);
  window.toggleTestimonialForm();

  // Reset form
  document.getElementById('testiName').value = '';
  document.getElementById('testiRole').value = '';
  document.getElementById('testiText').value = '';

  // Save
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_testimonials') || '[]');
    saved.push({ name, role, text, stars: selectedStars });
    localStorage.setItem('portfolio_testimonials', JSON.stringify(saved));
  } catch {}
};

// Load saved testimonials
(function loadTestimonials() {
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_testimonials') || '[]');
    saved.forEach((t, i) => {
      const slider = document.getElementById('testimonialsSlider');
      const dots = document.getElementById('testiDots');
      if (!slider) return;
      const initials = t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const starsHtml = '&#9733;'.repeat(t.stars) + '&#9734;'.repeat(5 - t.stars);
      const card = document.createElement('div');
      card.className = 'testimonial-card';
      card.innerHTML = `
        <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="author-avatar">${initials}</div>
          <div><strong>${t.name}</strong><span>${t.role}</span></div>
          <div class="testimonial-stars">${starsHtml}</div>
        </div>
      `;
      slider.appendChild(card);
      const dot = document.createElement('span');
      dot.className = 'testi-dot';
      const idx = (dots?.querySelectorAll('.testi-dot').length || 0);
      dot.onclick = () => window.testimonialsGoto(idx);
      dots?.appendChild(dot);
    });
  } catch {}
})();

// ── BLOG FUNCTIONS ──
const blogPostsData = {
  featured: {
    title: 'From IT Admin to DevOps: My Honest Transition Story',
    tags: ['DevOps', 'Career'],
    date: 'January 2025',
    readTime: '6 min read',
    content: `
      <p>Many people ask me how I went from managing physical servers and helpdesk tickets to learning Docker, CI/CD pipelines, and cloud infrastructure. The truth is it wasn't a straight line.</p>
      <h2>Where I Started</h2>
      <p>I started in IT administration — managing Active Directory, setting up LAN/WAN infrastructure, handling service desk escalations. I was good at it. Systems ran smoothly. But I kept watching developers and engineers solve problems in ways that felt like magic to me. I wanted to understand that world.</p>
      <h2>The Turning Point</h2>
      <p>After years in IT admin and database management, I realised the industry was shifting. "DevOps" kept appearing in job descriptions. Automation was becoming expected, not optional. I had two choices: adapt or fall behind.</p>
      <h2>What Actually Worked</h2>
      <ul>
        <li><strong>Building on existing strengths</strong> — My database and Linux knowledge gave me a running start with infrastructure</li>
        <li><strong>Hands-on labs over theory</strong> — I spun up free-tier AWS instances and broke things on purpose</li>
        <li><strong>Documenting everything</strong> — Writing about what I learned forced me to truly understand it</li>
        <li><strong>Finding community</strong> — Nigerian tech communities on Slack and WhatsApp kept me accountable</li>
      </ul>
      <h2>What I'd Tell You</h2>
      <p>The transition isn't about forgetting what you know. It's about connecting new tools to existing experience. Every problem I solved as an IT admin taught me something that made me a better DevOps engineer. Your background is not a limitation — it's your differentiator.</p>
    `
  },
  'sql-backup': {
    title: '5 SQL Server Backup Strategies Every DBA Should Know',
    tags: ['Database', 'IT Admin'],
    date: 'November 2024',
    readTime: '5 min read',
    content: `
      <p>After implementing automated backups that increased system uptime by 35%, I want to share the five strategies that made the real difference in our production environment.</p>
      <h2>1. Full + Differential + Log Backup Chain</h2>
      <p>Never rely on full backups alone. A combination of weekly full backups, daily differential backups, and hourly transaction log backups gives you fine-grained recovery points without massive storage overhead.</p>
      <h2>2. SQL Server Agent Automation</h2>
      <p>Manual backups will be forgotten. Use SQL Server Agent jobs to automate every backup. Set up alerts so the DBA is notified if a backup job fails — <code>sp_configure 'Database Mail'</code> is your friend.</p>
      <h2>3. Test Your Restores Regularly</h2>
      <p>A backup you've never tested is not a backup. Schedule monthly restore tests to a non-production environment. This is the practice that saved us when we actually needed a recovery.</p>
      <h2>4. Off-site and Cloud Storage</h2>
      <p>Local backups protect against database corruption. Off-site backups protect against hardware failure and disasters. Use backup compression and store to Azure Blob Storage or similar.</p>
      <h2>5. Monitor Backup History</h2>
      <p>Query <code>msdb.dbo.backupset</code> regularly to audit your backup history. Set up a dashboard so you can see at a glance which databases were backed up and when.</p>
    `
  },
  'sheets-automation': {
    title: 'How I Automated Inventory Tracking with Google Sheets',
    tags: ['Automation'],
    date: 'October 2024',
    readTime: '7 min read',
    content: `
      <p>Our inventory team was spending 3 hours every week on manual data entry, cross-referencing spreadsheets, and sending summary emails. Here's exactly how I eliminated that with Google Sheets and Apps Script.</p>
      <h2>The Problem</h2>
      <p>Multiple staff members updating the same sheet manually, no alerts when stock fell below thresholds, and a weekly summary email that someone had to write by hand every Friday afternoon.</p>
      <h2>The Solution Architecture</h2>
      <ul>
        <li>A master inventory sheet as the single source of truth</li>
        <li>Apps Script triggers firing on edit events</li>
        <li>Conditional formatting for visual low-stock alerts</li>
        <li>Automated email summaries via <code>MailApp.sendEmail()</code></li>
        <li>A time-based trigger running every Monday morning</li>
      </ul>
      <h2>Key Code Pattern</h2>
      <p>The trigger function checks if edited cells fall in the quantity column, compares against the minimum stock threshold, and fires an alert email if below. Simple, reliable, zero maintenance.</p>
      <p>After deployment: 40% improvement in tracking accuracy, zero manual summary emails, and the team actually trusts the data now because there's only one place it lives.</p>
    `
  },
  'docker-php': {
    title: 'Docker for Beginners: Containerising Your First PHP Application',
    tags: ['DevOps'],
    date: 'December 2024',
    readTime: '8 min read',
    content: `
      <p>Docker felt overwhelming when I first encountered it. After working through it hands-on with a real Laravel app, I want to give you the clearest possible path to your first running container.</p>
      <h2>Why Containerise?</h2>
      <p>The classic problem: "It works on my machine." Docker eliminates environment differences between development, staging, and production. Your app runs in the same environment everywhere.</p>
      <h2>Your First Dockerfile</h2>
      <p>For a PHP/Laravel app, you need a base image (<code>php:8.2-fpm</code>), your application files copied in, dependencies installed, and the right ports exposed. Start minimal — you can always add more.</p>
      <h2>Docker Compose for Local Development</h2>
      <p>Most real applications need multiple services: PHP, Nginx, MySQL, Redis. Docker Compose lets you define all of these in a single <code>docker-compose.yml</code> file and bring them all up with one command: <code>docker compose up</code>.</p>
      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>Don't copy <code>.env</code> files into images — use environment variables at runtime</li>
        <li>Don't run as root inside containers — create a dedicated user</li>
        <li>Don't use <code>latest</code> tags in production — always pin specific versions</li>
      </ul>
    `
  },
  'nigeria-tech': {
    title: 'Breaking Into Tech in Nigeria: What Nobody Tells You',
    tags: ['Career'],
    date: 'September 2024',
    readTime: '6 min read',
    content: `
      <p>My accounting degree didn't feel like a tech credential. What I didn't know was that analytical thinking is exactly what good IT professionals need — and that the path forward wasn't as narrow as I thought.</p>
      <h2>The Real Barrier Isn't What You Think</h2>
      <p>Most people focus on "I don't have a CS degree" as the blocker. In my experience, the real barriers are: access to practical experience, not knowing what roles exist, and underestimating transferable skills.</p>
      <h2>What Actually Opens Doors</h2>
      <p>Certifications help, but portfolio evidence closes deals. Every project I completed — even volunteer work — became a talking point. Document everything you do, even if it feels small.</p>
      <h2>The Advantage You Already Have</h2>
      <p>Growing up navigating resource constraints, solving problems with limited tools, and building resilience — these aren't soft skills. They're exactly what engineering and operations roles demand. Own that.</p>
      <h2>Community is Not Optional</h2>
      <p>The Nigerian tech ecosystem is vibrant. Communities like Ingressive for Good, She Code Africa, and various Slack groups have connected me to mentors, opportunities, and peers who genuinely want to see each other win.</p>
    `
  },
  'service-desk': {
    title: 'Service Desk Lessons: 10 Things That Make IT Support Exceptional',
    tags: ['IT Admin'],
    date: 'August 2024',
    readTime: '4 min read',
    content: `
      <p>After resolving hundreds of tickets and cutting average resolution time by 40%, I noticed the same patterns separating good IT support from truly great IT support.</p>
      <h2>The Top 10</h2>
      <ul>
        <li><strong>Own the ticket, not just the fix</strong> — follow up after resolution</li>
        <li><strong>Document solutions</strong> — the next occurrence should take minutes, not hours</li>
        <li><strong>Communicate proactively</strong> — users hate silence more than delays</li>
        <li><strong>Categorise accurately</strong> — good data drives better resourcing decisions</li>
        <li><strong>Fix root causes</strong> — if the same issue recurs, the first fix wasn't real</li>
        <li><strong>Know your escalation paths</strong> — fast routing beats slow heroics</li>
        <li><strong>Treat non-technical users with respect</strong> — frustration at a user's knowledge level is a skill gap in you</li>
        <li><strong>Automate recurring tasks</strong> — if you do something manually more than twice, script it</li>
        <li><strong>Measure what matters</strong> — track first-contact resolution rate, not just ticket count</li>
        <li><strong>Learn from every ticket</strong> — every problem is a lesson in disguise</li>
      </ul>
    `
  },
  'github-actions': {
    title: 'Setting Up Your First GitHub Actions CI/CD Pipeline',
    tags: ['DevOps', 'Automation'],
    date: 'July 2024',
    readTime: '10 min read',
    content: `
      <p>CI/CD sounds intimidating until you see how straightforward GitHub Actions makes it. Here's the step-by-step guide I wish I'd had when I started.</p>
      <h2>What CI/CD Actually Does</h2>
      <p>Continuous Integration automatically tests your code on every push. Continuous Deployment automatically deploys passing code to your server. Together, they eliminate manual deploy steps and catch bugs before they reach production.</p>
      <h2>Your First Workflow File</h2>
      <p>Create <code>.github/workflows/deploy.yml</code> in your repo. The structure is: a trigger (on push to main), a job (runs-on: ubuntu-latest), and steps (checkout, install, test, deploy). That's the whole skeleton.</p>
      <h2>Connecting to Your Server</h2>
      <p>Store your server credentials as GitHub Secrets, then use an SSH action to connect and run your deployment commands. Never hardcode credentials in workflow files.</p>
      <h2>Making It Production-Ready</h2>
      <ul>
        <li>Add a test step before deploy — the pipeline should fail fast if tests break</li>
        <li>Use environment protection rules for production deployments</li>
        <li>Set up notifications to Slack or email on failure</li>
        <li>Cache dependencies to speed up workflow runs</li>
      </ul>
    `
  }
};

window.openBlogPost = function(postId) {
  const post = blogPostsData[postId];
  if (!post) return;

  const modal = document.getElementById('blogModal');
  const content = document.getElementById('blogModalContent');
  if (!modal || !content) return;

  const tagHtml = post.tags.map(t => `<span class="blog-tag ${t.toLowerCase().replace(' ', '')}">${t}</span>`).join('');

  content.innerHTML = `
    <div class="blog-post-content">
      <div class="blog-post-meta">
        ${tagHtml}
        <span class="blog-date"><i class="fas fa-calendar-alt"></i> ${post.date}</span>
        <span class="blog-read"><i class="fas fa-clock"></i> ${post.readTime}</span>
      </div>
      <h1>${post.title}</h1>
      ${post.content}
      <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--mid);display:flex;align-items:center;gap:.75rem">
        <img src="1691446996009.jpg" alt="Victoria" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--gold)" onerror="this.style.display='none'"/>
        <div>
          <strong style="color:var(--light);display:block">Victoria Amarachi Philip</strong>
          <span style="font-size:.85rem;color:var(--muted)">IT Administrator → DevOps Professional</span>
        </div>
        <a href="index.html#contact" style="margin-left:auto" class="btn-primary" onclick="closeBlogModal()">
          <i class="fas fa-envelope"></i> Get in Touch
        </a>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeBlogModal = function(e) {
  const modal = document.getElementById('blogModal');
  if (e && e.target !== modal) return;
  modal && (modal.style.display = 'none');
  document.body.style.overflow = '';
};

window.filterBlogPosts = function() {
  const query = document.getElementById('blogSearch')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.blog-card');
  const featured = document.getElementById('blogFeatured');
  let visibleCount = 0;

  if (featured) {
    const featTitle = featured.querySelector('.blog-featured-title')?.textContent.toLowerCase() || '';
    const featExcerpt = featured.querySelector('.blog-featured-excerpt')?.textContent.toLowerCase() || '';
    const show = !query || featTitle.includes(query) || featExcerpt.includes(query);
    featured.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  }

  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
    const show = !query || title.includes(query) || desc.includes(query);
    card.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  const empty = document.getElementById('blogEmpty');
  if (empty) empty.style.display = visibleCount === 0 ? 'block' : 'none';
};

window.filterBlogByTag = function(btn) {
  document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  const cards = document.querySelectorAll('.blog-card');
  const featured = document.getElementById('blogFeatured');

  if (featured) {
    const tags = (featured.dataset.tags || '').split(' ');
    featured.style.display = filter === 'all' || tags.includes(filter) ? '' : 'none';
  }

  cards.forEach(card => {
    const tags = (card.dataset.tags || '').split(' ');
    card.style.display = filter === 'all' || tags.includes(filter) ? '' : 'none';
  });
};

window.toggleWritePost = function() {
  const form = document.getElementById('writePostForm');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.publishPost = function() {
  const title = document.getElementById('postTitle')?.value.trim();
  const category = document.getElementById('postCategory')?.value;
  const excerpt = document.getElementById('postExcerpt')?.value.trim();
  const content = document.getElementById('postContent')?.value.trim();
  const readTime = document.getElementById('postReadTime')?.value.trim() || '5 min';
  const dateVal = document.getElementById('postDate')?.value;

  if (!title || !excerpt) { alert('Title and excerpt are required.'); return; }

  const date = dateVal ? new Date(dateVal + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Now';

  // Register in post data
  const id = 'custom-' + Date.now();
  blogPostsData[id] = { title, tags: [category], date, readTime: readTime + ' read', content: content || `<p>${excerpt}</p>` };

  // Add to grid
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const gradients = {
    devops: 'linear-gradient(135deg,#4776e6,#8e54e9)',
    database: 'linear-gradient(135deg,#6a11cb,#2575fc)',
    career: 'linear-gradient(135deg,#f953c6,#b91d73)',
    automation: 'linear-gradient(135deg,#11998e,#38ef7d)',
    it: 'linear-gradient(135deg,#fc4a1a,#f7b733)'
  };
  const icons = { devops: 'fa-code-branch', database: 'fa-database', career: 'fa-user-graduate', automation: 'fa-robot', it: 'fa-server' };

  const card = document.createElement('article');
  card.className = 'blog-card fade-in';
  card.dataset.tags = category;
  card.innerHTML = `
    <div class="blog-card-header" style="background:${gradients[category] || 'linear-gradient(135deg,#667eea,#764ba2)'}">
      <i class="fas ${icons[category] || 'fa-pen'} blog-card-icon"></i>
    </div>
    <div class="blog-card-body">
      <div class="blog-card-meta">
        <span class="blog-tag ${category}">${category}</span>
        <span class="blog-date-sm">${date}</span>
      </div>
      <h3>${title}</h3>
      <p>${excerpt}</p>
      <div class="blog-card-footer">
        <span class="read-time"><i class="fas fa-clock"></i> ${readTime}</span>
        <button class="blog-read-link" onclick="openBlogPost('${id}')">Read More <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;
  grid.prepend(card);
  setTimeout(() => card.classList.add('visible'), 50);
  toggleWritePost();

  // Save
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_blog_posts') || '[]');
    saved.unshift({ id, title, category, excerpt, content, readTime, date });
    localStorage.setItem('portfolio_blog_posts', JSON.stringify(saved.slice(0, 20)));
  } catch {}
};

// Load saved blog posts
(function loadBlogPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_blog_posts') || '[]');
    saved.forEach(p => {
      blogPostsData[p.id] = { title: p.title, tags: [p.category], date: p.date, readTime: p.readTime + ' read', content: p.content || `<p>${p.excerpt}</p>` };
    });
  } catch {}
})();

/* ==========================================
   CERTIFICATES UPLOAD & GALLERY
   ========================================== */

// ── CERT UPLOAD TOGGLE ──
window.toggleCertUpload = function() {
  const form = document.getElementById('certUploadForm');
  if (!form) return;
  const open = form.style.display === 'none';
  form.style.display = open ? 'block' : 'none';
  const btn = document.getElementById('uploadCertBtn');
  if (btn) btn.innerHTML = open
    ? '<i class="fas fa-times"></i> Cancel'
    : '<i class="fas fa-plus"></i> Upload Certificate';
};

// ── CERT FILE INPUT ──
const certFileInput = document.getElementById('certFileInput');
const certFileDrop = document.getElementById('certFileDrop');
const certFilePreview = document.getElementById('certFilePreview');
let certFileData = null;

certFileInput?.addEventListener('change', e => handleCertFile(e.target.files[0]));

certFileDrop?.addEventListener('dragover', e => { e.preventDefault(); certFileDrop.style.borderColor = 'var(--gold)'; });
certFileDrop?.addEventListener('dragleave', () => { certFileDrop.style.borderColor = ''; });
certFileDrop?.addEventListener('drop', e => {
  e.preventDefault();
  certFileDrop.style.borderColor = '';
  handleCertFile(e.dataTransfer.files[0]);
});

function handleCertFile(file) {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    certFileData = { data: reader.result, type: file.type, name: file.name };
    if (certFilePreview) {
      certFilePreview.style.display = 'flex';
      const isImg = file.type.startsWith('image/');
      certFilePreview.innerHTML = `<i class="fas fa-${isImg ? 'image' : 'file-pdf'}"></i> ${file.name} <span style="margin-left:auto;color:var(--muted);font-size:.75rem">${(file.size/1024).toFixed(0)} KB</span>`;
    }
  };
  reader.readAsDataURL(file);
}

// ── SAVE CERTIFICATE ──
window.saveCertificate = function() {
  const name = document.getElementById('certName')?.value.trim();
  const issuer = document.getElementById('certIssuer')?.value.trim();
  const date = document.getElementById('certDate')?.value;
  const credId = document.getElementById('certCredId')?.value.trim();
  const category = document.getElementById('certCategory')?.value || 'other';

  if (!name || !issuer) { alert('Certificate name and issuer are required.'); return; }

  const dateStr = date
    ? new Date(date + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : 'N/A';

  const cert = { name, issuer, dateStr, credId, category, file: certFileData };
  addCertCard(cert);

  // Save to localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_certs') || '[]');
    saved.push(cert);
    localStorage.setItem('portfolio_certs', JSON.stringify(saved.slice(0, 50)));
  } catch {}

  // Reset form
  ['certName','certIssuer','certDate','certCredId'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  if (certFilePreview) certFilePreview.style.display = 'none';
  certFileData = null;
  if (certFileInput) certFileInput.value = '';
  toggleCertUpload();
};

const certGradients = {
  cloud: 'linear-gradient(135deg,#f7971e,#ff9900)',
  devops: 'linear-gradient(135deg,#4776e6,#8e54e9)',
  database: 'linear-gradient(135deg,#cc0000,#990000)',
  networking: 'linear-gradient(135deg,#11998e,#38ef7d)',
  security: 'linear-gradient(135deg,#f953c6,#b91d73)',
  development: 'linear-gradient(135deg,#6a11cb,#2575fc)',
  other: 'linear-gradient(135deg,#c9a84c,#a07028)'
};
const certIcons = {
  cloud: 'fa-cloud', devops: 'fa-code-branch', database: 'fa-database',
  networking: 'fa-network-wired', security: 'fa-shield-halved',
  development: 'fa-code', other: 'fa-certificate'
};

function addCertCard(cert) {
  const grid = document.getElementById('certsGrid');
  const empty = document.getElementById('certsEmpty');
  if (!grid) return;

  const card = document.createElement('div');
  card.className = 'cert-card fade-in';
  card.dataset.category = cert.category || 'other';

  const grad = certGradients[cert.category] || certGradients.other;
  const icon = certIcons[cert.category] || 'fa-certificate';
  const fileAttr = cert.file ? `data-file="${cert.file.data}" data-filetype="${cert.file.type}"` : '';

  card.innerHTML = `
    <div class="cert-card-header" style="background:${grad}">
      <i class="fas ${icon} cert-card-icon"></i>
      <div class="cert-card-cat">${cert.category}</div>
    </div>
    <div class="cert-card-body">
      <h5>${cert.name}</h5>
      <div class="cert-card-meta">
        <span class="cert-issuer"><i class="fas fa-building"></i> ${cert.issuer}</span>
        <span class="cert-date"><i class="fas fa-calendar"></i> ${cert.dateStr}</span>
      </div>
      <div class="cert-card-footer">
        <span class="cert-status earned"><i class="fas fa-check-circle"></i> Verified</span>
        <button class="cert-view-btn" onclick="viewCertModal(this)"
          data-name="${cert.name}" data-issuer="${cert.issuer}"
          data-date="${cert.dateStr}" data-id="${cert.credId || ''}" ${fileAttr}>View</button>
      </div>
    </div>
    <button class="cert-delete-btn" onclick="deleteCert(this)" title="Remove"><i class="fas fa-trash"></i></button>
  `;
  grid.prepend(card);
  setTimeout(() => card.classList.add('visible'), 50);
  if (empty) empty.style.display = 'none';
}

// ── VIEW CERT MODAL ──
window.viewCertModal = function(btn) {
  const name = btn.dataset.name || '';
  const issuer = btn.dataset.issuer || '';
  const date = btn.dataset.date || '';
  const credId = btn.dataset.id || '';
  const file = btn.dataset.file || '';
  const filetype = btn.dataset.filetype || '';

  const modal = document.getElementById('certModal');
  const content = document.getElementById('certModalContent');
  if (!modal || !content) return;

  let mediaHtml = '';
  if (file) {
    if (filetype.startsWith('image/')) {
      mediaHtml = `<img src="${file}" alt="${name}" class="cert-modal-img"/>`;
    } else if (filetype === 'application/pdf') {
      mediaHtml = `<embed src="${file}" type="application/pdf" width="100%" height="400px" style="border-radius:var(--radius);border:1px solid var(--mid);margin-bottom:1rem"/>`;
    }
  } else {
    mediaHtml = `<div style="height:140px;background:var(--dark-2);border:1px dashed var(--mid);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;flex-direction:column;gap:.5rem;color:var(--muted)"><i class="fas fa-certificate" style="font-size:3rem;color:var(--gold);opacity:.5"></i><span style="font-size:.85rem">No image uploaded</span></div>`;
  }

  content.innerHTML = `
    <div class="cert-modal-view">
      ${mediaHtml}
      <h3>${name}</h3>
      <p><i class="fas fa-building" style="color:var(--gold);margin-right:.4rem"></i> ${issuer}</p>
      <p><i class="fas fa-calendar" style="color:var(--gold);margin-right:.4rem"></i> Earned: ${date}</p>
      ${credId ? `<div class="cert-modal-id"><i class="fas fa-fingerprint" style="margin-right:.35rem"></i>${credId}</div>` : ''}
      ${file ? `<a href="${file}" download="${name}.${filetype.includes('pdf') ? 'pdf' : 'jpg'}" class="btn-primary" style="margin-top:1.2rem;display:inline-flex"><i class="fas fa-download"></i> Download Certificate</a>` : ''}
    </div>
  `;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeCertModal = function(e) {
  const modal = document.getElementById('certModal');
  if (e && e.target !== modal) return;
  modal && (modal.style.display = 'none');
  document.body.style.overflow = '';
};

// ── DELETE CERT ──
window.deleteCert = function(btn) {
  const card = btn.closest('.cert-card');
  card.style.opacity = '0'; card.style.transform = 'scale(0.85)';
  setTimeout(() => {
    card.remove();
    const grid = document.getElementById('certsGrid');
    const empty = document.getElementById('certsEmpty');
    if (grid && empty && grid.querySelectorAll('.cert-card').length === 0) {
      empty.style.display = 'block';
    }
  }, 300);
};

// ── FILTER CERTS ──
window.filterCerts = function(btn) {
  const row = btn.closest('.cert-filter-row');
  row?.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  document.querySelectorAll('.cert-card').forEach(card => {
    card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
  });
};

// ── LOAD SAVED CERTS ──
(function loadCerts() {
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_certs') || '[]');
    saved.forEach(cert => addCertCard(cert));
  } catch {}
})();

/* ==========================================
   NEW BLOG POSTS — Fun & Jokes + Inspiration
   ========================================== */

// Extend blogPostsData with new articles
Object.assign(blogPostsData, {

  'it-signs': {
    title: 'You Know You\'re an IT Person When… (25 Signs That Are Too Real)',
    tags: ['Fun & Jokes'],
    date: 'February 2025',
    readTime: '3 min read',
    content: `
      <p>There are two types of people in the world: those who call IT support, and those who <em>are</em> IT support. If you're the latter, you'll relate to every single one of these.</p>
      <h2>The Household Signs</h2>
      <ul>
        <li>You restart the router before anyone has even finished explaining the problem.</li>
        <li>Your family's first call when <em>anything</em> breaks — regardless of whether it's electronic — is you.</li>
        <li>You own more charging cables than you'll ever be able to count, and somehow still never have the right one.</li>
        <li>Your WiFi network name is something either deeply technical or deeply hilarious. Probably both.</li>
        <li>You have a "good laptop" and a "bad laptop." The bad one is for family use at Christmas.</li>
      </ul>
      <h2>The Workplace Signs</h2>
      <ul>
        <li>Someone says "the computer is slow" and you already know it hasn't been restarted in 47 days.</li>
        <li>You've explained what IT actually does at least 200 times, and people still think you "fix printers."</li>
        <li>"Have you tried turning it off and on again?" is not a joke to you. It is gospel.</li>
        <li>You check whether something is plugged in before you say a single word.</li>
        <li>A colleague's password is "Password1" and you have aged five years because of it.</li>
        <li>You've had to explain what a phishing email is to the same person. Three times. This month.</li>
        <li>Someone asks you to "just quickly" do something that will take three hours.</li>
      </ul>
      <h2>The Personal Signs</h2>
      <ul>
        <li>You narrate what you're doing when you fix something, like a nature documentary, because nobody else understands what's happening.</li>
        <li>You have at least one folder called "FINAL", one called "FINAL_v2", and one called "FINAL_USE_THIS_ONE_ACTUALLY".</li>
        <li>You speak in acronyms in casual conversation and don't notice people's confused faces.</li>
        <li>You've Googled an error message at 11 PM from bed. Voluntarily.</li>
        <li>The idea of using someone else's keyboard makes you mildly uncomfortable.</li>
        <li>You have dark mode on everything. Light mode feels like a personal attack.</li>
        <li>You back up your backups.</li>
      </ul>
      <h2>The Social Signs</h2>
      <ul>
        <li>At every family gathering, you end up crouched behind a television for 45 minutes.</li>
        <li>People preface technical questions with "I know you'll think this is stupid, but…" — and they're right that you'll think that, but you're kind enough not to say so.</li>
        <li>You've fixed a stranger's laptop at an airport/café because you simply could not watch them struggle.</li>
        <li>You judge people by what browser they use. Silently, but fiercely.</li>
        <li>You've Googled something for someone standing right next to you because it was faster than explaining.</li>
        <li>The phrase "it should be fine" makes your eye twitch.</li>
      </ul>
      <p>If you counted more than 15 of these, congratulations. You are fully, irreversibly IT. There is no going back. Welcome to the club — we have dark mode and coffee.</p>
    `
  },

  'debugging-stages': {
    title: 'The 7 Stages of Debugging: A Comedy in One Act',
    tags: ['Fun & Jokes'],
    date: 'March 2025',
    readTime: '4 min read',
    content: `
      <p>No one tells you when you enter tech that debugging will consume approximately 60% of your career. What they also don't tell you is that it follows the same emotional arc every. single. time. Here are the seven stages.</p>
      <h2>Stage 1: Confident Denial</h2>
      <p><em>"This should take five minutes."</em></p>
      <p>You have made a small change. It is fine. It will definitely work. You are experienced. You know what you're doing. You type the command. You press Enter. You wait.</p>
      <p>It does not work.</p>
      <h2>Stage 2: Logical Optimism</h2>
      <p><em>"The error message is clearly pointing to the issue."</em></p>
      <p>You read the error. You understand the error. You fix what the error pointed to. You run it again. A new error appears. The original error was a decoy. The system is taunting you. You remain calm.</p>
      <h2>Stage 3: The Google Spiral</h2>
      <p>You search the exact error message in quotes. You find a Stack Overflow post from 2013. The accepted answer says "same issue! Fixed it." There is no explanation of how. The person who asked the question is unreachable. You open seven more tabs.</p>
      <h2>Stage 4: Irrational Experimentation</h2>
      <p>You are now changing things at random, undoing them, changing them back, and adding <code>console.log("HERE")</code> and <code>console.log("HERE 2")</code> in places that make no logical sense. You restart the service. You restart your laptop. You briefly consider restarting your career.</p>
      <h2>Stage 5: Blame</h2>
      <p>It is not your fault. It is the framework. It is the library. It is whoever wrote this codebase. It is the infrastructure. It is the version. It is Monday. It is the specific atmospheric conditions in your office today.</p>
      <h2>Stage 6: Unexpected Enlightenment</h2>
      <p>You stand up to make a cup of tea. You are not thinking about the bug. You are thinking about tea. And then — in the corridor, holding an empty mug — it arrives. The answer. Clear as day. A semicolon. A missing bracket. A config value that was wrong for three weeks. You run back to your desk.</p>
      <p>It works.</p>
      <h2>Stage 7: Revisionist History</h2>
      <p><em>"Oh, it was just a config issue. Simple fix."</em></p>
      <p>You will not tell anyone about stages 1 through 6. You will close all 23 browser tabs. You will commit the fix with a vague message like "fix: update config." And then you will do it all over again next week.</p>
      <p>This is the way.</p>
    `
  },

  'job-titles': {
    title: 'Tech Job Titles Translated: What They Actually Mean',
    tags: ['Fun & Jokes'],
    date: 'January 2025',
    readTime: '3 min read',
    content: `
      <p>After years in IT, I've become fluent in a second language: corporate job description speak. Allow me to translate.</p>
      <h2>The Job Titles</h2>
      <ul>
        <li><strong>"Ninja / Rockstar / Wizard"</strong> — We will expect superhero output on a human budget.</li>
        <li><strong>"Junior with senior responsibilities"</strong> — We cannot afford a senior. Congratulations on your promotion that comes with no pay.</li>
        <li><strong>"IT Generalist"</strong> — You will do everything. Infrastructure, databases, the printer, and also explaining why the internet is slow to someone whose laptop is in airplane mode.</li>
        <li><strong>"DevOps Engineer"</strong> — You are a developer who also ops, an ops person who also devs, and the person who gets paged at 2 AM regardless of which one you thought you were.</li>
        <li><strong>"Self-motivated"</strong> — There is no onboarding process. Figure it out.</li>
      </ul>
      <h2>The Requirements Section</h2>
      <ul>
        <li><strong>"Fast-paced environment"</strong> — There are no processes. There are also no post-mortems. There is only doing.</li>
        <li><strong>"Wear many hats"</strong> — The team is the entire hat rack.</li>
        <li><strong>"Passionate about technology"</strong> — You will not be compensated extra for caring deeply, but we'd like you to care deeply.</li>
        <li><strong>"5+ years experience in a technology released 3 years ago"</strong> — Classic.</li>
        <li><strong>"Strong communication skills"</strong> — You will be explaining technical things to non-technical stakeholders. Repeatedly. With a smile.</li>
        <li><strong>"Startup culture"</strong> — We have a ping pong table and no pension contribution.</li>
      </ul>
      <h2>The Benefits</h2>
      <ul>
        <li><strong>"Competitive salary"</strong> — Competitive with what? Unclear.</li>
        <li><strong>"Remote-friendly"</strong> — You can work from home. On the days we allow you to work from home. Which we'll decide later.</li>
        <li><strong>"Unlimited leave"</strong> — Nobody actually takes leave. There is social pressure disguised as freedom.</li>
        <li><strong>"Great team culture"</strong> — We have a WhatsApp group and someone once brought cake.</li>
        <li><strong>"Growth opportunities"</strong> — There is one promotion available every 18 months. You will compete for it with six other people.</li>
      </ul>
      <p>If you've survived a few job hunts in tech, you're laughing because it's true — and crying for the same reason. Good luck out there. Read the descriptions slowly. Ask about overtime in the interview. And always check Glassdoor.</p>
    `
  },

  'friday-devops': {
    title: 'A DevOps Engineer\'s Friday Afternoon: A Timeline',
    tags: ['Fun & Jokes'],
    date: 'December 2024',
    readTime: '3 min read',
    content: `
      <p>There is an unwritten rule in every engineering organisation: <em>do not deploy on a Friday.</em> Everyone knows this rule. And yet.</p>
      <h2>The Timeline</h2>
      <p><strong>2:47 PM</strong> — A developer sends a message: "Hey, it's a tiny change. Just a flag. Should be fine to push before the weekend, right?"</p>
      <p><strong>2:49 PM</strong> — You say yes. You know better. You say yes anyway.</p>
      <p><strong>3:02 PM</strong> — The pipeline passes. You relax. You start drafting your "signing off for the weekend" message.</p>
      <p><strong>3:08 PM</strong> — The monitoring dashboard turns amber. You refresh it. It was probably a blip.</p>
      <p><strong>3:09 PM</strong> — It turns red.</p>
      <p><strong>3:11 PM</strong> — Slack notifications begin. The first one is from someone in a timezone where it is already Saturday. They are not happy.</p>
      <p><strong>3:15 PM</strong> — You roll back. The rollback takes longer than expected because nothing about this is expected.</p>
      <p><strong>3:30 PM</strong> — The rollback is done. Services are recovering. You breathe.</p>
      <p><strong>3:32 PM</strong> — A new alert fires. The rollback has broken a different thing. You did not know these two things were connected. Nobody knew. It was undocumented. It is always undocumented.</p>
      <p><strong>4:00 PM</strong> — You are now on a call with four people. Two of them are managers. One of them keeps asking "so when will it be fixed?" You stop answering that question.</p>
      <p><strong>5:15 PM</strong> — Your family has eaten dinner without you.</p>
      <p><strong>6:45 PM</strong> — Everything is stable. You write a brief incident report. You swear, again, that you will never deploy on a Friday.</p>
      <p><strong>Next Friday, 2:47 PM</strong> — "Hey, it's a tiny change…"</p>
      <hr style="border-color:var(--mid);margin:1.5rem 0"/>
      <p style="color:var(--muted);font-style:italic">This post is dedicated to everyone who has ever lost a Friday to production. You are seen. You are appreciated. Please set up better deployment gates.</p>
    `
  },

  'not-behind': {
    title: 'You Are Not Behind. You Are Right On Time.',
    tags: ['Inspiration', 'Career'],
    date: 'March 2025',
    readTime: '4 min read',
    content: `
      <p>LinkedIn will make you feel like everyone else woke up at 25 with a clear path, a stack of certifications, and a six-figure remote salary. They didn't. The platform just doesn't show the mess in between.</p>
      <h2>The Comparison Trap</h2>
      <p>I know what it's like to scroll through profiles of people who seem to have "figured it out" at ages that feel impossibly young. To see announcements of promotions, certifications earned, offers accepted — and feel a quiet ache of "why not me yet?"</p>
      <p>Here is what those posts don't show: the years of uncertainty before. The applications that didn't get responses. The self-doubt at 1 AM. The imposter syndrome in the first week of the "big new role." The pivots, the pauses, the starting over.</p>
      <h2>Your Path Is Not a Race</h2>
      <p>I didn't come into IT through a straight corridor. I came through Accounting, through hard-won self-teaching, through years of proving myself in rooms that weren't built for someone like me. Was it the fastest route? No. Was it mine? Absolutely.</p>
      <p>Every experience you've had — even the ones that felt like detours — has been adding to something. The soft skills. The resilience. The perspective that makes you see problems differently from someone who only ever had one path.</p>
      <h2>The Only Timeline That Matters</h2>
      <p>There is no universal schedule for when you should have achieved what. There is only your life, your growth, and the gap between where you are and where you want to be — which you get to close at your own pace.</p>
      <p>The person who started learning to code at 35 and landed their first tech role at 38 is not behind the person who did it at 22. They are on a different, equally valid journey.</p>
      <h2>What I Want You to Remember</h2>
      <ul>
        <li>Growth that is slow is still growth.</li>
        <li>A quiet season is not a failed season.</li>
        <li>The fact that you are still trying is evidence that you haven't given up on yourself.</li>
        <li>Someone out there is inspired by how far you've come — even if you can't see it from where you're standing.</li>
      </ul>
      <p>You are not behind. You are building. Keep going.</p>
    `
  },

  'imposter-syndrome': {
    title: 'What Imposter Syndrome Actually Means (It\'s Not What You Think)',
    tags: ['Inspiration', 'Career'],
    date: 'February 2025',
    readTime: '5 min read',
    content: `
      <p>For a long time, I thought imposter syndrome was a sign that I didn't belong. That the voice whispering "you don't really know what you're doing" was telling the truth. I was wrong about what it meant.</p>
      <h2>What It Actually Is</h2>
      <p>Imposter syndrome — that nagging feeling of being "found out," of being less competent than people around you think — is almost always a sign of one specific thing: <strong>you are growing.</strong></p>
      <p>You don't feel like an imposter doing things you've mastered. You feel like an imposter at the frontier of your capability. Which means that every time the feeling hits, you are standing exactly where learning happens.</p>
      <h2>Who Gets It</h2>
      <p>Here is what the research shows: imposter syndrome is most common in high achievers. People who care deeply about doing well. People with high standards for themselves. People who, ironically, are often <em>more</em> competent than those around them who feel perfectly confident.</p>
      <p>The colleague who never doubts themselves? They might simply not be paying close enough attention to notice the gaps. Your self-awareness is not your weakness. It is your quality control.</p>
      <h2>My Own Experience</h2>
      <p>I have walked into rooms where I was the only woman, the only Nigerian, the only person who came from an Accounting background rather than Computer Science. Every time, the voice said "you don't belong here."</p>
      <p>Every time, I stayed anyway. And every time, I left that room knowing more than when I entered — about the subject, and about my own capacity to handle unfamiliar territory.</p>
      <h2>How to Use It</h2>
      <ul>
        <li><strong>Name it when it arrives.</strong> Say: "Ah. I'm in learning territory." That reframe changes the feeling from threat to signal.</li>
        <li><strong>Don't wait to feel ready.</strong> Readiness is rarely felt in advance. It is discovered by doing.</li>
        <li><strong>Document your wins.</strong> Keep a record of problems you've solved, skills you've gained, and moments where you surprised yourself. Read it when the voice gets loud.</li>
        <li><strong>Talk about it.</strong> The moment you admit imposter syndrome to a trusted peer, you discover that they feel it too. Every time. Without exception.</li>
      </ul>
      <p>The goal is not to silence the voice permanently. The goal is to move forward alongside it — to carry the doubt in your pocket while you walk confidently into the room anyway.</p>
      <p>That is courage. And you already have it.</p>
    `
  },

  'consistency': {
    title: 'Small Steps, Big Systems: How Consistency Beats Talent Every Time',
    tags: ['Inspiration'],
    date: 'January 2025',
    readTime: '5 min read',
    content: `
      <p>I want to tell you something that took me years to really believe: the most important factor in where I am today is not intelligence, not talent, and not luck. It is showing up. Repeatedly. When it wasn't convenient.</p>
      <h2>The Myth of the Breakthrough Moment</h2>
      <p>We love the story of sudden transformation. The overnight success. The one course that changed everything. The "aha" moment that unlocked a career.</p>
      <p>Those stories are real — but they're the visible tip of an invisible iceberg. Underneath every breakthrough is hundreds of ordinary hours that nobody photographed or posted about.</p>
      <h2>What My Learning Actually Looked Like</h2>
      <p>I didn't learn Linux in a weekend. I learned it in 20-minute sessions on my commute, in the 30 minutes before my household woke up, in the hour after the kids were in bed. Not glamorous. Not a montage. Just steady repetition across months.</p>
      <p>When I started learning Docker, I set a rule: at least one command, one concept, or one article per day. Some days that was 45 minutes of deep practice. Some days it was reading a single paragraph. Both counted. Both compounded.</p>
      <h2>The Compound Effect in Learning</h2>
      <p>One percent better every day sounds like nothing. Over a year, it's 37 times better. That's not motivational mathematics — that's the actual result of compounding small improvements.</p>
      <p>The problem is that the early stages feel invisible. Day 3 of consistent learning looks almost identical to Day 1. Day 60 feels different. Day 180 is unrecognisable from where you started. But you have to get through the invisible phase to reach the visible one.</p>
      <h2>What This Means in Practice</h2>
      <ul>
        <li><strong>Lower the bar for starting.</strong> Five minutes counts. One terminal command counts. One concept read counts. Starting builds the habit; the habit builds the skill.</li>
        <li><strong>Protect the streak, not the session.</strong> A ten-minute day is infinitely better than a zero-minute day. The streak teaches your brain that this is who you are now.</li>
        <li><strong>Trust the process when it feels slow.</strong> Slow learning is not failed learning. It is deep learning. The concepts that take longest to understand are often the ones that stick longest.</li>
        <li><strong>Remove friction.</strong> Keep the terminal open. Keep the course tab pinned. Keep the book on your desk. Convenience is not laziness — it's engineering your environment for the person you're becoming.</li>
      </ul>
      <p>You don't need more talent. You don't need a perfect plan. You need to open the laptop one more time, learn one more thing, and trust that small steps build the biggest systems.</p>
    `
  },

  'african-women-tech': {
    title: 'Dear African Woman in Tech: Your Presence Is Not a Coincidence',
    tags: ['Inspiration', 'Career'],
    date: 'November 2024',
    readTime: '6 min read',
    content: `
      <p>This is the letter I needed when I was starting out. When I was the only woman at the table, or the only African voice in the room, and I kept wondering whether I had walked through the wrong door by mistake.</p>
      <h2>You Were Meant to Be There</h2>
      <p>Your presence in tech is not an administrative error. It is not charity, a quota, or a happy accident. You are there because you earned it — through study, through hustle, through navigating barriers that many of your colleagues have never had to think about.</p>
      <p>The fact that the room doesn't always look like you doesn't mean the room doesn't belong to you. It means the room is still catching up.</p>
      <h2>What Nobody Told Me</h2>
      <p>Nobody told me that I would have to prove myself twice for half the credit in some spaces. Nobody told me that being visibly different would sometimes be exhausting in ways that were hard to explain to people who'd never experienced it. Nobody told me that some days the most radical thing I could do was simply stay.</p>
      <p>But nobody also told me how powerful it would feel to solve a problem that had stumped a whole team. Nobody told me the quiet satisfaction of knowing a system inside out because I'd refused to give up on understanding it. Nobody told me that the women who came behind me would look at what I'd done and walk a little taller because of it.</p>
      <h2>The Weight and the Gift of Visibility</h2>
      <p>When you are one of few, you carry visibility as both weight and gift. The weight: you sometimes represent more than yourself. One mistake feels like it echoes. The gift: one success does too. Your excellence is not just yours — it opens something for everyone who looks like you and comes after you.</p>
      <p>This is not a burden you asked for. But it is real, and it is meaningful, and you are capable of carrying it.</p>
      <h2>What I Want You to Know</h2>
      <ul>
        <li>You are allowed to take up space. Not apologetically. Fully.</li>
        <li>Your accent, your name, your background — none of it disqualifies you. It enriches every team you join.</li>
        <li>Find your people. The women who will celebrate your wins without jealousy and hold you up when the room gets heavy.</li>
        <li>Rest when you need to. You cannot pour from an empty cup, and the tech industry will take everything you give it if you let it.</li>
        <li>Stay. Not for them — for you. And for the girl somewhere right now who needs to see that it is possible.</li>
      </ul>
      <p>You are not a coincidence. You are not a mistake. You are exactly where you are supposed to be — and the industry is better for it.</p>
      <p>With love and solidarity,<br/><strong>Victoria</strong></p>
    `
  }

});
