let DATA = null;
let currentView = 'dashboard';

function $(id) { return document.getElementById(id); }

async function init() {
  const res = await fetch('data.json');
  DATA = await res.json();
  renderSidebar();
  renderDashboard();
  showView('dashboard');
}

function showView(name) {
  currentView = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = $(name + '-view');
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-btn[data-view="${name}"]`);
  if (navBtn) navBtn.classList.add('active');
}

function renderSidebar() {
  const p = DATA.profile;
  const s = document.getElementById('sidebar');
  s.innerHTML = `
    <div class="sidebar-logo">
      <img src="images/logo_icon.png" alt="" onerror="this.remove()">
      <span>PROfolio</span>
    </div>
    <div class="sidebar-profile">
      <div class="avatar-wrapper">
        <img src="images/photo.png" alt="" class="avatar" onload="this.classList.add('loaded')" onerror="this.remove()">
        <div class="avatar-placeholder">PG</div>
      </div>
      <div class="profile-name">${p.name}</div>
      <div class="profile-title">${p.title}</div>
      <div class="profile-contact"><span class="profile-icon">✉</span> ${p.email}</div>
      <div class="profile-contact"><span class="profile-icon">📞</span> ${p.phone}</div>
    </div>
    <div class="sidebar-nav">
      <button class="nav-btn active" data-view="dashboard" onclick="showView('dashboard'); renderDashboard();">
        <span class="nav-icon">⊞</span> Proyectos
      </button>
    </div>
    <div class="sidebar-stats">
      <div class="stat-item"><div class="stat-value">${DATA.stats.total}</div><div class="stat-label">Proyectos</div></div>
      <div class="stat-item"><div class="stat-value">${DATA.stats.featured}</div><div class="stat-label">Destacados</div></div>
      <div class="stat-item"><div class="stat-value">${DATA.stats.categories}</div><div class="stat-label">Categorias</div></div>
      <div class="stat-item"><div class="stat-value">${new Set(DATA.projects.flatMap(p => p.skills)).size}</div><div class="stat-label">Skills</div></div>
    </div>
  `;
}

function renderDashboard(filter) {
  let projects = [...DATA.projects].sort((a, b) => {
  if (a.id === 19) return -1;
  if (b.id === 19) return 1;
  if (a.featured && !b.featured) return -1;
  if (!a.featured && b.featured) return 1;
  return 0;
});
  if (filter) {
    const q = filter.toLowerCase();
    projects = projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.need.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  const grid = document.getElementById('dashboard-grid');
  if (projects.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon"></div><p>No se encontraron proyectos</p></div>`;
    return;
  }
  grid.innerHTML = projects.map(p => {
    const statusClass = p.status.toLowerCase().replace(/ /g, '-');
    const techs = p.technologies.slice(0, 4);
    return `
      <div class="project-card ${p.featured ? 'featured' : ''}" onclick="openProject(${p.id})">
        <div class="card-top">
          <span class="card-category">${p.category}</span>
          ${p.featured ? '<span class="card-featured-star">★</span>' : ''}
          <span class="card-status ${statusClass}">${p.status}</span>
        </div>
        <div class="card-title">${p.title}</div>
        <div class="card-summary">${p.summary}</div>
        ${techs.length ? `<div class="card-techs">${techs.map(t => `<span class="tech-chip">${t}</span>`).join('')}</div>` : ''}
        <div class="card-footer">
          <span>${p.period}</span>
          <span>${p.evidences.length} evidencia${p.evidences.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    `;
  }).join('');
}

function openProject(id) {
  currentProjectId = id;
  const p = DATA.projects.find(x => x.id === id);
  if (!p) return;
  showView('detail');
  renderDetail(p);
  window.scrollTo(0, 0);
}

function goBack() {
  showView('dashboard');
  renderDashboard();
}

function renderDetail(p) {
  const container = document.getElementById('detail-body');
  const statusClass = p.status.toLowerCase().replace(/ /g, '-');
  const hasObs = p.observations && p.observations.trim();
  const hasLessons = p.lessons && p.lessons.length;
  const hasEvidences = p.evidences && p.evidences.length;

  container.innerHTML = `
    <div class="hero-card">
      <div class="hero-title">${p.title}</div>
      <div class="hero-meta">
        <span>${p.period}</span>
        <span class="card-status ${statusClass}">${p.status}</span>
        ${p.featured ? '<span style="color:var(--coral)">Destacado</span>' : ''}
      </div>
    </div>

    <div class="info-card">
      <span class="card-category">${p.category}</span>
    </div>

    <div class="info-card-row">
      <div class="info-card">
        <div class="info-label yellow">NECESIDAD / CONTEXTO</div>
        <div class="info-text muted">${p.need}</div>
      </div>
      <div class="info-card">
        <div class="info-label teal">SOLUCION</div>
        <div class="info-text muted">${p.solution}</div>
      </div>
    </div>

    <div class="info-card">
      <div class="info-label coral">RESULTADO / IMPACTO</div>
      <div class="info-text muted">${p.result}</div>
    </div>

    ${hasObs ? `
    <div class="info-card">
      <div class="info-label yellow">OBSERVACIONES</div>
      <div class="info-text muted">${p.observations}</div>
    </div>
    ` : ''}

    ${p.skills.length ? `
    <div class="info-card">
      <div class="info-label teal">Habilidades</div>
      <div class="tag-group">${p.skills.map(s => `<span class="tag tag-teal">${s}</span>`).join('')}</div>
    </div>
    ` : ''}

    ${p.technologies.length ? `
    <div class="info-card">
      <div class="info-label coral">Tecnologias</div>
      <div class="tag-group">${p.technologies.map(t => `<span class="tag tag-coral">${t}</span>`).join('')}</div>
    </div>
    ` : ''}

    ${hasEvidences ? `
    <div class="info-card">
      <div class="info-label teal">Evidencias</div>
      ${p.evidences.map(e => `
        <div class="evidence-item">
          <span class="evidence-type">${e.type}</span>
          <div class="evidence-info">
            <div class="evidence-title">${e.title}</div>
            ${e.description ? `<div class="evidence-desc">${e.description}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${p.topics.length ? `
    <div class="info-card">
      <div class="info-label yellow">Temas</div>
      <div class="tag-group">${p.topics.map(t => `<span class="tag tag-teal">${t}</span>`).join('')}</div>
    </div>
    ` : ''}

    ${hasLessons ? `
    <div class="info-card">
      <div class="info-label coral">LECCIONES APRENDIDAS</div>
      <ul class="lessons-list">${p.lessons.map(l => `<li>${l}</li>`).join('')}</ul>
    </div>
    ` : ''}
  `;
}

let searchTimer = null;
function onSearch(val) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (currentView === 'dashboard') renderDashboard(val);
  }, 300);
}

document.addEventListener('DOMContentLoaded', init);
