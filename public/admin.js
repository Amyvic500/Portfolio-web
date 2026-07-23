let CURRENT_MESSAGES = [];
let SELECTED_MSG_ID = null;

document.addEventListener('DOMContentLoaded', async () => {
  const loggedIn = await checkAuth();
  if (loggedIn) showDashboard();

  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  document.getElementById('certForm').addEventListener('submit', submitCertForm);
  document.getElementById('projectForm').addEventListener('submit', submitProjectForm);
  document.getElementById('cvForm').addEventListener('submit', submitCvForm);
  document.getElementById('profileImgForm').addEventListener('submit', submitProfileImageForm);
  document.getElementById('heroTaglineForm').addEventListener('submit', submitHeroTaglineForm);
});

async function checkAuth() {
  try {
    await api('/admin/check');
    return true;
  } catch (e) {
    return false;
  }
}

async function doLogin() {
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  try {
    await api('/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
    showDashboard();
  } catch (e) {
    errEl.textContent = e.message || 'Login failed';
    errEl.style.display = 'block';
  }
}

async function doLogout() {
  await api('/admin/logout', { method: 'POST' });
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginGate').style.display = 'flex';
}

function showDashboard() {
  document.getElementById('loginGate').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  const hashTab = location.hash.replace('#', '');
  switchTab(['messages','certificates','projects','testimonials','cv','profile'].includes(hashTab) ? hashTab : 'messages');
}

function switchTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
  document.getElementById('tab-' + tab).style.display = 'block';
  if (tab === 'messages') loadMessages();
  if (tab === 'certificates') loadCertsAdmin();
  if (tab === 'projects') loadProjectsAdmin();
  if (tab === 'testimonials') loadTestimonialsAdmin();
  if (tab === 'cv') loadCvAdmin();
  if (tab === 'profile') loadProfileAdmin();
}

/* ══════════ MESSAGES ══════════ */
async function loadMessages() {
  const list = document.getElementById('msgList');
  try {
    CURRENT_MESSAGES = await api('/messages');
    renderMsgList();
    updateUnreadBadge();
  } catch (e) {
    list.innerHTML = `<p style="padding:1rem;color:var(--red)">Failed to load messages: ${e.message}</p>`;
  }
}

function updateUnreadBadge() {
  const unread = CURRENT_MESSAGES.filter(m => m.status === 'new').length;
  const badge = document.getElementById('unreadBadge');
  if (unread > 0) {
    badge.textContent = unread + ' new';
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function renderMsgList() {
  const list = document.getElementById('msgList');
  if (!CURRENT_MESSAGES.length) {
    list.innerHTML = '<p style="padding:1rem;color:var(--muted)">No messages yet.</p>';
    return;
  }
  list.innerHTML = CURRENT_MESSAGES.map(m => `
    <div class="msg-row ${m.status === 'new' ? 'unread' : ''} ${m.id === SELECTED_MSG_ID ? 'active-row' : ''}" onclick="openMessage(${m.id})">
      <div class="msg-row-top">
        <span>${escapeHtml(m.full_name)}</span>
        <span class="msg-status-pill ${m.status}">${m.status}</span>
      </div>
      <div class="msg-row-sub">${escapeHtml(m.subject || 'General')} · ${new Date(m.created_at).toLocaleDateString()}</div>
    </div>
  `).join('');
}

async function openMessage(id) {
  SELECTED_MSG_ID = id;
  renderMsgList();
  const m = CURRENT_MESSAGES.find(x => x.id === id);
  const detail = document.getElementById('msgDetail');
  detail.innerHTML = `
    <h3 style="margin-bottom:.3rem">${escapeHtml(m.full_name)}</h3>
    <p style="color:var(--muted);margin-bottom:1rem">${escapeHtml(m.email)} ${m.phone ? '· ' + escapeHtml(m.phone) : ''}</p>
    <p><strong>Subject:</strong> ${escapeHtml(m.subject || 'General')}</p>
    ${m.budget ? `<p><strong>Budget:</strong> ${escapeHtml(m.budget)}</p>` : ''}
    <p style="margin:1rem 0;white-space:pre-wrap;line-height:1.6">${escapeHtml(m.message)}</p>
    ${m.reply_text ? `
      <div style="background:var(--dark-2,#151515);border-radius:8px;padding:1rem;margin-bottom:1rem">
        <strong style="color:var(--accent)">Your reply</strong> <span style="color:var(--muted);font-size:.8rem">(${new Date(m.replied_at).toLocaleString()})</span>
        <p style="margin-top:.5rem;white-space:pre-wrap">${escapeHtml(m.reply_text)}</p>
      </div>` : ''}
    <div class="reply-box">
      <label>Reply to ${escapeHtml(m.full_name)}</label>
      <textarea id="replyText" placeholder="Type your reply — this will be emailed to ${escapeHtml(m.email)}"></textarea>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <button class="btn-primary" onclick="sendReply(${m.id})"><i class="fas fa-paper-plane"></i> Send Reply</button>
        ${m.status !== 'archived' ? `<button class="btn-outline" onclick="archiveMessage(${m.id})"><i class="fas fa-box-archive"></i> Archive</button>` : ''}
      </div>
      <span id="replyMsg" class="admin-form-msg"></span>
    </div>
  `;
  if (m.status === 'new') {
    await api(`/messages/${id}/read`, { method: 'PATCH' });
    m.status = 'read';
    renderMsgList();
    updateUnreadBadge();
  }
}

async function sendReply(id) {
  const text = document.getElementById('replyText').value.trim();
  const out = document.getElementById('replyMsg');
  if (!text) { out.textContent = 'Please write a reply first.'; out.style.color = 'var(--red)'; return; }
  try {
    await api(`/messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ replyText: text }) });
    out.textContent = 'Reply sent!';
    out.style.color = 'var(--accent)';
    await loadMessages();
    openMessage(id);
  } catch (e) {
    out.textContent = e.message;
    out.style.color = 'var(--red)';
  }
}

async function archiveMessage(id) {
  await api(`/messages/${id}/archive`, { method: 'PATCH' });
  await loadMessages();
  document.getElementById('msgDetail').innerHTML = '<p style="color:var(--muted);padding:2rem;text-align:center">Select a message to view and reply.</p>';
}

/* ══════════ CERTIFICATES ══════════ */
async function loadCertsAdmin() {
  const wrap = document.getElementById('certAdminList');
  const certs = await api('/certificates');
  wrap.innerHTML = certs.map(c => `
    <div class="admin-row-card">
      <div><strong>${escapeHtml(c.name)}</strong> <span style="color:var(--muted);font-size:.82rem">— ${escapeHtml(c.issuer || '')} ${c.issue_date ? '· ' + escapeHtml(c.issue_date) : ''}</span></div>
      <button class="btn-outline" onclick="deleteCert(${c.id})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('') || '<p style="color:var(--muted)">No certificates yet.</p>';
}

async function submitCertForm(e) {
  e.preventDefault();
  const out = document.getElementById('certFormMsg');
  const fd = new FormData();
  fd.append('name', document.getElementById('certName').value);
  fd.append('issuer', document.getElementById('certIssuer').value);
  fd.append('issue_date', document.getElementById('certDate').value);
  fd.append('category', document.getElementById('certCategory').value);
  fd.append('status', document.getElementById('certStatus').value);
  const file = document.getElementById('certFile').files[0];
  if (file) fd.append('file', file);

  try {
    await api('/certificates', { method: 'POST', body: fd });
    out.textContent = 'Certificate added!';
    out.style.color = 'var(--accent)';
    e.target.reset();
    loadCertsAdmin();
  } catch (err) {
    out.textContent = err.message;
    out.style.color = 'var(--red)';
  }
}

async function deleteCert(id) {
  if (!confirm('Delete this certificate?')) return;
  await api(`/certificates/${id}`, { method: 'DELETE' });
  loadCertsAdmin();
}

/* ══════════ PROJECTS ══════════ */
async function loadProjectsAdmin() {
  const wrap = document.getElementById('projectAdminList');
  const projects = await api('/projects');
  wrap.innerHTML = projects.map(p => `
    <div class="admin-row-card">
      <div><strong>${escapeHtml(p.title)}</strong> <span style="color:var(--muted);font-size:.82rem">— ${escapeHtml(p.category)}</span></div>
      <button class="btn-outline" onclick="deleteProject(${p.id})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('') || '<p style="color:var(--muted)">No projects yet.</p>';
}

async function submitProjectForm(e) {
  e.preventDefault();
  const out = document.getElementById('projectFormMsg');
  const payload = {
    title: document.getElementById('pTitle').value,
    category: document.getElementById('pCategory').value,
    subtitle: document.getElementById('pSubtitle').value,
    description: document.getElementById('pDesc').value,
    stack: document.getElementById('pStack').value,
    outcomes: document.getElementById('pOutcomes').value,
    github_url: document.getElementById('pGithub').value,
    demo_url: document.getElementById('pDemo').value,
    featured: document.getElementById('pFeatured').checked,
  };
  try {
    await api('/projects', { method: 'POST', body: JSON.stringify(payload) });
    out.textContent = 'Project added!';
    out.style.color = 'var(--accent)';
    e.target.reset();
    loadProjectsAdmin();
  } catch (err) {
    out.textContent = err.message;
    out.style.color = 'var(--red)';
  }
}

async function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  await api(`/projects/${id}`, { method: 'DELETE' });
  loadProjectsAdmin();
}

/* ══════════ TESTIMONIALS ══════════ */
async function loadTestimonialsAdmin() {
  const wrap = document.getElementById('testimonialAdminList');
  const rows = await api('/testimonials/all');
  wrap.innerHTML = rows.map(t => `
    <div class="admin-row-card" style="align-items:flex-start;flex-direction:column;gap:.6rem">
      <div style="display:flex;justify-content:space-between;width:100%">
        <strong>${escapeHtml(t.name)}</strong>
        <span class="msg-status-pill ${t.status === 'approved' ? 'replied' : 'new'}">${t.status}</span>
      </div>
      <p style="color:var(--muted);font-size:.9rem">${escapeHtml(t.message)}</p>
      <div style="display:flex;gap:.5rem">
        ${t.status !== 'approved' ? `<button class="btn-primary" style="padding:.4rem .8rem;font-size:.78rem" onclick="approveTestimonial(${t.id})"><i class="fas fa-check"></i> Approve</button>` : ''}
        <button class="btn-outline" onclick="deleteTestimonial(${t.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted)">No testimonials yet.</p>';
}

async function approveTestimonial(id) {
  await api(`/testimonials/${id}/approve`, { method: 'PATCH' });
  loadTestimonialsAdmin();
}

async function deleteTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  await api(`/testimonials/${id}`, { method: 'DELETE' });
  loadTestimonialsAdmin();
}

/* ══════════ CV ══════════ */
async function loadCvAdmin() {
  const info = document.getElementById('currentCvInfo');
  const cv = await api('/cv');
  info.textContent = cv ? `Current CV: ${cv.file_name} (uploaded ${new Date(cv.uploaded_at).toLocaleString()})` : 'No CV uploaded yet.';
}

async function submitCvForm(e) {
  e.preventDefault();
  const out = document.getElementById('cvFormMsg');
  const file = document.getElementById('cvFile').files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('file', file);
  try {
    await api('/cv', { method: 'POST', body: fd });
    out.textContent = 'CV updated!';
    out.style.color = 'var(--accent)';
    e.target.reset();
    loadCvAdmin();
  } catch (err) {
    out.textContent = err.message;
    out.style.color = 'var(--red)';
  }
}

/* ══════════ PROFILE (photo + hero tagline) ══════════ */
async function loadProfileAdmin() {
  try {
    const settings = await api('/settings');
    const img = document.getElementById('profileImgPreview');
    const placeholder = document.getElementById('profileImgPlaceholder');
    if (settings.profile_image) {
      img.src = settings.profile_image + '?v=' + Date.now();
      img.style.display = 'block';
      placeholder.style.display = 'none';
    } else {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    }
    document.getElementById('heroTaglineText').value = settings.hero_tagline || '';
  } catch (e) {
    // Leave defaults in place if settings can't be loaded
  }
}

async function submitProfileImageForm(e) {
  e.preventDefault();
  const out = document.getElementById('profileImgFormMsg');
  const file = document.getElementById('profileImgFile').files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('image', file);
  try {
    await api('/settings/profile-image', { method: 'POST', body: fd });
    out.textContent = 'Profile photo updated!';
    out.style.color = 'var(--accent)';
    e.target.reset();
    loadProfileAdmin();
  } catch (err) {
    out.textContent = err.message;
    out.style.color = 'var(--red)';
  }
}

async function submitHeroTaglineForm(e) {
  e.preventDefault();
  const out = document.getElementById('heroTaglineFormMsg');
  const value = document.getElementById('heroTaglineText').value.trim();
  try {
    await api('/settings/hero_tagline', { method: 'POST', body: JSON.stringify({ value }) });
    out.textContent = 'Tagline saved!';
    out.style.color = 'var(--accent)';
  } catch (err) {
    out.textContent = err.message;
    out.style.color = 'var(--red)';
  }
}
