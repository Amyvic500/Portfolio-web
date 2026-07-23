document.addEventListener('DOMContentLoaded', () => {
  loadSiteSettings();
  loadTestimonials();
  wireContactForm();
  wireTestimonialForm();
});

// ── LOAD DYNAMIC SITE CONTENT (profile photo, hero tagline) ──
async function loadSiteSettings() {
  try {
    const settings = await api('/settings');

    if (settings.profile_image) {
      const heroPhoto = document.getElementById('heroPhoto');
      const heroInitials = document.getElementById('heroInitials');
      if (heroPhoto) {
        // Cache-bust so a freshly uploaded photo shows immediately everywhere
        heroPhoto.src = settings.profile_image + '?v=' + Date.now();
        heroPhoto.style.display = '';
        if (heroInitials) heroInitials.style.display = 'none';
      }
    }

    if (settings.hero_tagline) {
      const tagline = document.querySelector('.hero-tagline');
      if (tagline) tagline.textContent = settings.hero_tagline;
    }
  } catch (e) {
    // Settings are optional enhancements — the static defaults already in
    // the HTML remain visible if this call fails for any reason.
  }
}

// ── LOAD & RENDER TESTIMONIALS ──
async function loadTestimonials() {
  const slider = document.getElementById('testimonialsSlider');
  const empty = document.getElementById('testimonialsEmpty');
  if (!slider) return;
  try {
    const rows = await api('/testimonials');
    if (!rows.length) {
      empty.style.display = 'block';
      return;
    }
    slider.innerHTML = rows.map((t, i) => `
      <div class="testimonial-card ${i === 0 ? 'active' : ''}">
        <div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>
        <p class="testimonial-text">${escapeHtml(t.message)}</p>
        <div class="testimonial-author">
          <div class="author-avatar">${escapeHtml((t.name || '?').slice(0,2).toUpperCase())}</div>
          <div><strong>${escapeHtml(t.name)}</strong>${t.role ? `<span>${escapeHtml(t.role)}</span>` : ''}</div>
          <div class="testimonial-stars">${'&#9733;'.repeat(t.rating || 5)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    empty.style.display = 'block';
  }
}

// ── SUBMIT NEW TESTIMONIAL ──
function toggleTestimonialForm() {
  const form = document.getElementById('addTestimonialForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function wireTestimonialForm() {
  document.querySelectorAll('#starRating .star').forEach(star => {
    star.addEventListener('click', () => {
      const val = Number(star.dataset.val);
      document.getElementById('starRating').dataset.selected = val;
      document.querySelectorAll('#starRating .star').forEach((s, i) => {
        s.style.opacity = i < val ? '1' : '.35';
      });
    });
  });
}

async function submitTestimonial() {
  const name = document.getElementById('testiName').value.trim();
  const role = document.getElementById('testiRole').value.trim();
  const message = document.getElementById('testiText').value.trim();
  const rating = Number(document.getElementById('starRating').dataset.selected || 5);

  if (!name || !message) {
    alert('Please fill in your name and message.');
    return;
  }
  try {
    await api('/testimonials', { method: 'POST', body: JSON.stringify({ name, role, message, rating }) });
    alert('Thank you! Your testimonial has been submitted and will appear once approved.');
    document.getElementById('testiName').value = '';
    document.getElementById('testiRole').value = '';
    document.getElementById('testiText').value = '';
    toggleTestimonialForm();
  } catch (e) {
    alert('Something went wrong: ' + e.message);
  }
}

// ── CONTACT FORM ──
function validateForm() {
  let valid = true;
  const fields = [
    ['fullName', 'nameError', 'Please enter your name.'],
    ['email', 'emailError', 'Please enter a valid email.'],
    ['subject', 'subjectError', 'Please select a subject.'],
    ['message', 'messageError', 'Please enter a message.'],
  ];
  fields.forEach(([id, errId, msg]) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el.value.trim()) {
      err.textContent = msg;
      valid = false;
    } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
      err.textContent = 'Please enter a valid email.';
      valid = false;
    } else {
      err.textContent = '';
    }
  });
  const consent = document.getElementById('consent');
  const consentErr = document.getElementById('consentError');
  if (!consent.checked) {
    consentErr.textContent = 'Please agree to be contacted.';
    valid = false;
  } else {
    consentErr.textContent = '';
  }
  return valid;
}

function wireContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
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

    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      subject: document.getElementById('subject').value,
      budget: document.getElementById('budget').value,
      message: document.getElementById('message').value.trim(),
      consent: document.getElementById('consent').checked,
    };

    try {
      await api('/messages', { method: 'POST', body: JSON.stringify(payload) });
      success.style.display = 'flex';
      contactForm.reset();
    } catch (e) {
      error.style.display = 'flex';
      error.querySelector('span') ? null : (error.textContent = e.message || error.textContent);
    } finally {
      text.style.display = 'flex';
      loader.style.display = 'none';
      btn.disabled = false;
    }
  });
}
