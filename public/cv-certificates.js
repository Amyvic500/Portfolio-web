let ALL_CERTS = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCV();
  loadCertificates();
});

async function loadCV() {
  try {
    const cv = await api('/cv');
    const meta = document.getElementById('cvMeta');
    if (cv) {
      meta.textContent = `Last updated: ${new Date(cv.uploaded_at).toLocaleDateString()}`;
    } else {
      meta.textContent = 'CV not uploaded yet.';
      document.getElementById('cvDownloadBtn').classList.add('disabled');
    }
  } catch (e) { /* ignore */ }
}

const CATEGORY_COLORS = {
  cloud: 'linear-gradient(135deg,#f7971e,#ff9900)',
  devops: 'linear-gradient(135deg,#11998e,#38ef7d)',
  database: 'linear-gradient(135deg,#cc0000,#990000)',
  networking: 'linear-gradient(135deg,#2575fc,#6a11cb)',
  security: 'linear-gradient(135deg,#f953c6,#b91d73)',
  development: 'linear-gradient(135deg,#0066cc,#004999)',
  other: 'linear-gradient(135deg,#555,#333)',
};
const CATEGORY_ICONS = {
  cloud: 'fa-cloud', devops: 'fa-gears', database: 'fa-database',
  networking: 'fa-network-wired', security: 'fa-shield-halved',
  development: 'fa-code', other: 'fa-certificate',
};

async function loadCertificates() {
  const grid = document.getElementById('certsGrid');
  const empty = document.getElementById('certsEmpty');
  try {
    ALL_CERTS = await api('/certificates');
    renderCerts(ALL_CERTS);
    if (!ALL_CERTS.length) empty.style.display = 'block';
  } catch (e) {
    empty.style.display = 'block';
  }
}

function renderCerts(list) {
  const grid = document.getElementById('certsGrid');
  grid.innerHTML = list.map(c => `
    <div class="cert-card" data-category="${c.category}">
      <div class="cert-card-header" style="background:${CATEGORY_COLORS[c.category] || CATEGORY_COLORS.other}">
        <i class="fas ${CATEGORY_ICONS[c.category] || 'fa-certificate'} cert-card-icon"></i>
        <div class="cert-card-cat">${escapeHtml(c.category)}</div>
      </div>
      <div class="cert-card-body">
        <h5>${escapeHtml(c.name)}</h5>
        <div class="cert-card-meta">
          <span class="cert-issuer"><i class="fas fa-building"></i> ${escapeHtml(c.issuer || 'N/A')}</span>
          <span class="cert-date"><i class="fas fa-calendar"></i> ${escapeHtml(c.issue_date || '')}</span>
        </div>
        <div class="cert-card-footer">
          <span class="cert-status ${c.status === 'earned' ? 'earned' : 'pending'}">
            <i class="fas ${c.status === 'earned' ? 'fa-check-circle' : 'fa-hourglass-half'}"></i> ${c.status === 'earned' ? 'Verified' : 'In Progress'}
          </span>
          ${c.file_path ? `<button class="cert-view-btn" onclick='viewCertModal(${JSON.stringify(c)})'>View</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function filterCerts(btn) {
  document.querySelectorAll('#certFilterRow .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  renderCerts(f === 'all' ? ALL_CERTS : ALL_CERTS.filter(c => c.category === f));
}

function viewCertModal(c) {
  const modal = document.getElementById('certModal');
  const content = document.getElementById('certModalContent');
  const isPdf = (c.file_path || '').toLowerCase().endsWith('.pdf');
  content.innerHTML = `
    <h3>${escapeHtml(c.name)}</h3>
    <p style="color:var(--muted);margin-bottom:1rem">${escapeHtml(c.issuer || '')} ${c.issue_date ? '· ' + escapeHtml(c.issue_date) : ''}</p>
    ${isPdf
      ? `<iframe src="${c.file_path}" style="width:100%;height:70vh;border:none;border-radius:var(--radius)"></iframe>`
      : `<img src="${c.file_path}" style="width:100%;border-radius:var(--radius)" alt="${escapeHtml(c.name)}"/>`}
    <a href="${c.file_path}" target="_blank" class="btn-primary" style="margin-top:1rem;display:inline-flex">
      <i class="fas fa-external-link-alt"></i> Open Full Size
    </a>
  `;
  modal.style.display = 'flex';
}

function closeCertModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.closest('.modal-close')) return;
  document.getElementById('certModal').style.display = 'none';
}
