const state = { authenticated: false, activeTag: null, activeMenu: null };
const signinBtn = document.getElementById('signinBtn');
const navItems = [...document.querySelectorAll('[data-requires-auth]')];
const filterDate = document.getElementById('filterDate');
const filterRegion = document.getElementById('filterRegion');
const filterArea = document.getElementById('filterArea');
const chartCards = [...document.querySelectorAll('.chart-card')];
const kbSearch = document.getElementById('kbSearch');
const tagButtons = [...document.querySelectorAll('.tag')];
const kbItems = [...document.querySelectorAll('.kb-list .list-item')];
const menuLinks = [...document.querySelectorAll('.menu-link')];
const brandbar = document.querySelector('.brandbar');
const megas = { rd: document.getElementById('mega-rd'), services: document.getElementById('mega-services'), affinity: document.getElementById('mega-affinity'), about: document.getElementById('mega-about') };

function positionMega(el) {
  if (!brandbar || !el) return;
  const rect = brandbar.getBoundingClientRect();
  el.style.setProperty('--mega-top', `${Math.round(rect.bottom)}px`);
}
const routes = {
  home: document.getElementById('page-home'),
  'data-hub': document.getElementById('page-hub'),
  notebooks: document.getElementById('page-notebooks'),
  knowledge: document.getElementById('page-knowledge'),
};
const generic = document.getElementById('page-generic');

function updateAuthUI() {
  const disabledClass = 'disabled';
  navItems.forEach(el => {
    if (state.authenticated) {
      el.classList.remove(disabledClass);
    } else {
      el.classList.add(disabledClass);
    }
  });
  document.querySelector('.auth-indicator span').textContent = state.authenticated ? 'Secure Access Granted' : 'Secure Access Required';
}

function filterCharts() {
  const d = filterDate.value;
  const r = filterRegion.value;
  const a = filterArea.value;
  chartCards.forEach(card => {
    const matchDate = d === 'all' || card.dataset.date === d;
    const matchRegion = r === 'all' || card.dataset.region === r;
    const matchArea = a === 'all' || card.dataset.area === a;
    const show = matchDate && matchRegion && matchArea;
    card.style.display = show ? 'block' : 'none';
  });
}

function applyTag(tag) {
  state.activeTag = tag === state.activeTag ? null : tag;
  tagButtons.forEach(b => {
    const active = b.dataset.tag === state.activeTag;
    b.classList.toggle('active', active);
  });
  filterKB();
}

function filterKB() {
  const q = (kbSearch.value || '').toLowerCase();
  kbItems.forEach(item => {
    const text = (item.querySelector('.list-title').textContent + ' ' + item.querySelector('.list-meta').textContent).toLowerCase();
    const tags = (item.dataset.tags || '').toLowerCase();
    const matchText = q === '' || text.includes(q);
    const matchTag = !state.activeTag || tags.includes(state.activeTag);
    const show = matchText && matchTag;
    item.style.display = show ? 'block' : 'none';
  });
}

function setMenu(key) {
  state.activeMenu = key;
  Object.entries(megas).forEach(([k, el]) => {
    const on = k === state.activeMenu;
    el.classList.toggle('show', on);
    if (on) positionMega(el);
  });
  menuLinks.forEach(b => b.classList.toggle('active', b.dataset.menu === state.activeMenu));
}

function hideMenus() {
  state.activeMenu = null;
  Object.values(megas).forEach(el => el.classList.remove('show'));
  menuLinks.forEach(b => b.classList.remove('active'));
}

function showRoute(key) {
  const known = routes[key];
  Object.values(routes).forEach(el => el && el.classList.remove('active'));
  if (known) {
    known.classList.add('active');
    generic.classList.remove('active');
  } else {
    const title = key.replace(/-/g, ' ').toUpperCase();
    generic.innerHTML = `<h2>${title}</h2><p>Антарктический раздел в разработке. Содержимое появится скоро.</p>`;
    generic.classList.add('active');
  }
}

function initRouting() {
  const key = (location.hash || '#home').slice(1);
  showRoute(key);
  window.addEventListener('hashchange', () => {
    const k = (location.hash || '#home').slice(1);
    showRoute(k);
  });
}

signinBtn.addEventListener('click', () => {
  state.authenticated = !state.authenticated;
  signinBtn.textContent = state.authenticated ? 'Sign Out' : 'Sign In';
  updateAuthUI();
});

[filterDate, filterRegion, filterArea].forEach(el => {
  el.addEventListener('change', filterCharts);
});

kbSearch.addEventListener('input', filterKB);
tagButtons.forEach(b => b.addEventListener('click', () => applyTag(b.dataset.tag)));
menuLinks.forEach(b => {
  b.addEventListener('mouseenter', () => setMenu(b.dataset.menu));
  if (b.tagName === 'BUTTON') {
    b.addEventListener('click', () => setMenu(b.dataset.menu));
  }
});
document.addEventListener('click', e => {
  const inside = e.target.closest('.mega') || e.target.closest('.mainnav');
  if (!inside) hideMenus();
});

brandbar.addEventListener('mouseleave', e => {
  const to = e.relatedTarget;
  if (!(to && to.closest('.mega'))) hideMenus();
});

Object.values(megas).forEach(el => {
  el.addEventListener('mouseleave', e => {
    const to = e.relatedTarget;
    if (!(to && (to.closest('.mega') || to.closest('.mainnav') || to.closest('.brandbar')))) {
      hideMenus();
    }
  });
});

window.addEventListener('resize', () => {
  if (state.activeMenu) { positionMega(megas[state.activeMenu]); }
});
window.addEventListener('scroll', () => {
  if (state.activeMenu) { positionMega(megas[state.activeMenu]); }
});

updateAuthUI();
filterCharts();
filterKB();
initRouting();
