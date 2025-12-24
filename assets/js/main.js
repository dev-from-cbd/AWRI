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
let hideTimer = null;

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
  const indicator = document.querySelector('.auth-indicator span');
  if (indicator) {
    indicator.textContent = state.authenticated ? 'Secure Access Granted' : 'Secure Access Required';
  }
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

if (signinBtn) {
  signinBtn.addEventListener('click', () => {
    state.authenticated = !state.authenticated;
    signinBtn.textContent = state.authenticated ? 'Sign Out' : 'Sign In';
    updateAuthUI();
  });
}

[filterDate, filterRegion, filterArea].filter(Boolean).forEach(el => {
  el.addEventListener('change', filterCharts);
});

if (kbSearch) {
  kbSearch.addEventListener('input', filterKB);
}
tagButtons.forEach(b => b.addEventListener('click', () => applyTag(b.dataset.tag)));
menuLinks.forEach(b => {
  const key = b.dataset.menu;
  if (key && megas[key] && key !== 'affinity') {
    b.addEventListener('mouseenter', () => setMenu(key));
  }
  if (b.tagName === 'BUTTON' && key && megas[key] && key !== 'affinity') {
    b.addEventListener('click', () => setMenu(key));
  }
  if (b.tagName === 'A' && key && megas[key] && key !== 'affinity') {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      setMenu(key);
    });
  }
});
document.addEventListener('click', e => {
  const inside = e.target.closest('.mega') || e.target.closest('.mainnav');
  if (!inside) hideMenus();
});

function isPointerOverNav(target) {
  if (!target) return false;
  return !!(target.closest('.mega') || target.closest('.mainnav') || target.closest('.brandbar'));
}

if (brandbar) {
  brandbar.addEventListener('mouseleave', e => {
    const to = e.relatedTarget;
    if (to && to.closest('.mega')) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      const overMega = document.querySelector(':hover') && document.querySelector(':hover').closest('.mega');
      if (!overMega) hideMenus();
    }, 140);
  });
  brandbar.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
}

Object.values(megas).filter(Boolean).forEach(el => {
  el.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
  el.addEventListener('mouseleave', e => {
    const to = e.relatedTarget;
    if (to && (to.closest('.mega') || to.closest('.mainnav') || to.closest('.brandbar'))) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hideMenus(), 140);
  });
});

// Robust auto-hide when pointer leaves all menu areas
window.addEventListener('mousemove', e => {
  if (!isPointerOverNav(e.target)) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hideMenus(), 160);
  } else {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }
});
window.addEventListener('mouseleave', () => hideMenus());
window.addEventListener('keydown', e => { if (e.key === 'Escape') hideMenus(); });

window.addEventListener('resize', () => {
  if (state.activeMenu) { positionMega(megas[state.activeMenu]); }
});
window.addEventListener('scroll', () => {
  if (state.activeMenu) { positionMega(megas[state.activeMenu]); }
});

const heroArt = document.querySelector('.hero-art');
let parallaxTick = false;
const PARALLAX_BASE = -80;  // базовое смещение: больше винограда в кадре
const PARALLAX_MIN = -260;  // нижний предел (не уходить слишком вверх)
const PARALLAX_MAX = -40;   // верхний предел (не опускать слишком вниз)
function applyParallax() {
  if (!heroArt) return;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  const raw = PARALLAX_BASE - Math.round(y * 0.25);
  const clamped = Math.max(PARALLAX_MIN, Math.min(PARALLAX_MAX, raw));
  heroArt.style.backgroundPosition = `center ${clamped}px`;
}
window.addEventListener('scroll', () => {
  if (!parallaxTick) {
    parallaxTick = true;
    requestAnimationFrame(() => { applyParallax(); parallaxTick = false; });
  }
});
applyParallax();

updateAuthUI();
filterCharts();
filterKB();
initRouting();

function initNewsCarousels() {
  const wrappers = document.querySelectorAll('.news-carousel-wrapper');
  wrappers.forEach(wrapper => {
    const container = wrapper.querySelector('.news-carousel-container');
    const list = wrapper.querySelector('.news-list');
    const prevBtn = wrapper.querySelector('.news-nav-prev');
    const nextBtn = wrapper.querySelector('.news-nav-next');
    if (!container || !list || !prevBtn || !nextBtn) return;
    const state = { itemsPerView: 1, totalItems: list.querySelectorAll('.news-item').length, currentIndex: 0 };
    function updateItemsPerView() {
      state.itemsPerView = window.innerWidth < 900 ? 1 : 2.5;
      const visibleFullItems = Math.floor(state.itemsPerView);
      const maxIndex = Math.max(0, state.totalItems - visibleFullItems);
      if (state.currentIndex > maxIndex) {
        state.currentIndex = maxIndex;
        scrollToIndex(state.currentIndex, false);
      }
    }
    function updateButtons() {
      const visibleFullItems = Math.floor(state.itemsPerView);
      const maxIndex = Math.max(0, state.totalItems - visibleFullItems);
      prevBtn.disabled = state.currentIndex <= 0;
      nextBtn.disabled = state.currentIndex >= maxIndex;
    }
    function scrollToIndex(index, animate) {
      const firstItem = list.querySelector('.news-item');
      if (!firstItem) return;
      const gap = parseInt(window.getComputedStyle(list).gap) || 18;
      const itemWidth = firstItem.offsetWidth;
      const amount = index * (itemWidth + gap);
      list.style.transition = animate ? 'transform 0.4s ease' : 'none';
      list.style.transform = `translateX(-${amount}px)`;
      updateButtons();
    }
    function scrollPrev() {
      if (state.currentIndex > 0) {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
        scrollToIndex(state.currentIndex, true);
      }
    }
    function scrollNext() {
      const visibleFullItems = Math.floor(state.itemsPerView);
      const maxIndex = Math.max(0, state.totalItems - visibleFullItems);
      if (state.currentIndex < maxIndex) {
        state.currentIndex = Math.min(maxIndex, state.currentIndex + 1);
        scrollToIndex(state.currentIndex, true);
      }
    }
    prevBtn.style.display = 'flex';
    nextBtn.style.display = 'flex';
    prevBtn.addEventListener('click', scrollPrev);
    nextBtn.addEventListener('click', scrollNext);
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateItemsPerView();
        updateButtons();
      }, 250);
    });
    updateItemsPerView();
    updateButtons();
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initNewsCarousels());
} else {
  initNewsCarousels();
}

// Prevent single-word widows in news titles by binding the last two words
function preventTitleWidows() {
  const titles = document.querySelectorAll('.news-title');
  titles.forEach(el => {
    const text = (el.textContent || '').trim();
    // Replace the last space with a non-breaking space
    el.textContent = text.replace(/\s+([^\s]+)$/, '\u00A0$1');
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preventTitleWidows);
} else {
  preventTitleWidows();
}
