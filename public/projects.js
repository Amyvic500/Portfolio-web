let ALL_PROJECTS = [];

document.addEventListener('DOMContentLoaded', loadProjects);

const CATEGORY_ICON = {
  healthcare: 'fa-hospital-user', network: 'fa-network-wired', database: 'fa-database',
  automation: 'fa-boxes-stacked', web: 'fa-code', dashboard: 'fa-chart-pie', other: 'fa-diagram-project',
};
const CATEGORY_GRADIENT = {
  healthcare: 'linear-gradient(135deg,#00c9a7,#0066cc)',
  network: 'linear-gradient(135deg,#f7971e,#ffd200)',
  database: 'linear-gradient(135deg,#6a11cb,#2575fc)',
  automation: 'linear-gradient(135deg,#11998e,#38ef7d)',
  web: 'linear-gradient(135deg,#f953c6,#b91d73)',
  dashboard: 'linear-gradient(135deg,#fc4a1a,#f7b733)',
  other: 'linear-gradient(135deg,#555,#333)',
};
const CATEGORY_LABEL = {
  healthcare: 'Healthcare Tech', network: 'IT & Network', database: 'Database',
  automation: 'Automation', web: 'Web Apps', dashboard: 'Dashboards', other: 'Project',
};

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  const empty = document.getElementById('projectsEmpty');
  try {
    ALL_PROJECTS = await api('/projects');
    renderProjects(ALL_PROJECTS);
    if (!ALL_PROJECTS.length) empty.style.display = 'block';
  } catch (e) {
    empty.style.display = 'block';
  }
}

function renderProjects(list) {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = list.map(p => {
    const stack = (p.stack || '').split(',').map(s => s.trim()).filter(Boolean);
    const outcomes = (p.outcomes || '').split('\n').map(s => s.trim()).filter(Boolean);
    return `
    <div class="project-card ${p.featured ? 'featured-card' : ''}" data-category="${p.category}">
      ${p.featured ? '<div class="project-badge">Featured</div>' : ''}
      <div class="project-card-header">
        <div class="project-icon" style="background:${CATEGORY_GRADIENT[p.category] || CATEGORY_GRADIENT.other}">
          <i class="fas ${CATEGORY_ICON[p.category] || CATEGORY_ICON.other}"></i>
        </div>
        <div class="project-category-tag">${CATEGORY_LABEL[p.category] || 'Project'}</div>
      </div>
      <h3 class="project-title">${escapeHtml(p.title)}</h3>
      ${p.subtitle ? `<p class="project-subtitle">${escapeHtml(p.subtitle)}</p>` : ''}
      <p class="project-desc">${escapeHtml(p.description)}</p>
      ${stack.length ? `<div class="project-stack">${stack.map(s => `<span>${escapeHtml(s)}</span>`).join('')}</div>` : ''}
      ${outcomes.length ? `<div class="project-outcomes">${outcomes.map(o => `<div class="outcome-item"><i class="fas fa-check"></i> ${escapeHtml(o)}</div>`).join('')}</div>` : ''}
      ${(p.github_url || p.demo_url) ? `
      <div class="project-links">
        ${p.github_url ? `<a href="${p.github_url}" class="project-link" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
        ${p.demo_url ? `<a href="${p.demo_url}" class="project-link primary" target="_blank"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}

function filterProjects(btn) {
  document.querySelectorAll('#projectFilterBar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  renderProjects(f === 'all' ? ALL_PROJECTS : ALL_PROJECTS.filter(p => p.category === f));
}
