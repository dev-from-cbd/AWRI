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

// News carousel functionality
const newsCarousel = {
  container: null, // Carousel container element
  list: null, // News list element
  prevBtn: null, // Previous button
  nextBtn: null, // Next button
  itemsPerView: 4, // Number of items visible at once (desktop)
  totalItems: 0, // Total number of news items
  currentIndex: 0, // Current scroll position index
  
  init() {
    // Initialize carousel elements
    this.container = document.querySelector('.news-carousel-container'); // Get carousel container
    this.list = document.querySelector('.news-list'); // Get news list
    this.prevBtn = document.querySelector('.news-nav-prev'); // Get previous button
    this.nextBtn = document.querySelector('.news-nav-next'); // Get next button
    
    // Check if carousel elements exist
    if (!this.container || !this.list || !this.prevBtn || !this.nextBtn) return;
    
    // Get all news items
    const items = this.list.querySelectorAll('.news-item'); // Select all news items
    this.totalItems = items.length; // Store total count
    
    // Calculate items per view based on screen size
    this.updateItemsPerView(); // Update responsive items per view
    
    // Always show buttons (they will be disabled if not needed)
    this.prevBtn.style.display = 'flex'; // Show previous button
    this.nextBtn.style.display = 'flex'; // Show next button
    
    // Add event listeners
    this.prevBtn.addEventListener('click', () => this.scrollPrev()); // Previous button click
    this.nextBtn.addEventListener('click', () => this.scrollNext()); // Next button click
    
    // Update on window resize
    let resizeTimer; // Debounce timer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer); // Clear previous timer
      resizeTimer = setTimeout(() => {
        this.updateItemsPerView(); // Update items per view
        this.updateButtons(); // Update button states
      }, 250); // Wait 250ms after resize
    });
    
    // Initialize button states
    this.updateButtons(); // Set initial button states
  },
  
  updateItemsPerView() {
    // Update items per view based on window width
    const width = window.innerWidth; // Get window width
    if (width < 900) {
      this.itemsPerView = 1; // 1 item on mobile
    } else {
      this.itemsPerView = 2.5; // 2.5 items on desktop (peek effect - 3rd item half-visible, larger text)
    }
    
    // Buttons are always visible, just update their disabled state
    
    // Ensure current index is valid
    // For 2.5 items, we can scroll until the last item is fully visible
    // So maxIndex = totalItems - 2 (since we show 2 full + 0.5 peek)
    const visibleFullItems = Math.floor(this.itemsPerView); // 2 full items
    const maxIndex = Math.max(0, this.totalItems - visibleFullItems); // Maximum valid index
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex; // Clamp to max index
      this.scrollToIndex(this.currentIndex, false); // Scroll without animation
    }
  },
  
  scrollPrev() {
    // Scroll to previous single item
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - 1); // Decrease index by 1
      this.scrollToIndex(this.currentIndex, true); // Scroll with animation
    }
  },
  
  scrollNext() {
    // Scroll to next single item
    // For 2.5 items view, max index allows last item to be fully visible
    const visibleFullItems = Math.floor(this.itemsPerView); // 2 full items
    const maxIndex = Math.max(0, this.totalItems - visibleFullItems); // Maximum index
    if (this.currentIndex < maxIndex) {
      this.currentIndex = Math.min(maxIndex, this.currentIndex + 1); // Increase index by 1
      this.scrollToIndex(this.currentIndex, true); // Scroll with animation
    }
  },
  
  scrollToIndex(index, animate = true) {
    // Scroll carousel to specific index using transform
    if (!this.list || !this.container) return; // Safety check
    
    // Get first news item to calculate its actual width
    const firstItem = this.list.querySelector('.news-item'); // Get first news item
    if (!firstItem) return; // Safety check
    
    // Calculate scroll position using actual item width
    const gap = parseInt(window.getComputedStyle(this.list).gap) || 18; // Get gap value
    const itemWidth = firstItem.offsetWidth; // Actual item width from DOM
    const scrollAmount = index * (itemWidth + gap); // Total scroll amount (1 item per step)
    
    // Apply transform
    if (animate) {
      this.list.style.transition = 'transform 0.4s ease'; // Smooth transition
    } else {
      this.list.style.transition = 'none'; // No transition
    }
    this.list.style.transform = `translateX(-${scrollAmount}px)`; // Apply transform
    
    // Update button states after transition
    if (animate) {
      setTimeout(() => this.updateButtons(), 400); // Update after animation
    } else {
      this.updateButtons(); // Update immediately
    }
  },
  
  updateButtons() {
    // Update button disabled states
    // For 2.5 items view, calculate max index based on visible full items
    const visibleFullItems = Math.floor(this.itemsPerView); // 2 full items
    const maxIndex = Math.max(0, this.totalItems - visibleFullItems); // Maximum index
    this.prevBtn.disabled = this.currentIndex <= 0; // Disable if at start
    this.nextBtn.disabled = this.currentIndex >= maxIndex; // Disable if at end
  }
};

// Initialize news carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => newsCarousel.init()); // Wait for DOM
} else {
  newsCarousel.init(); // Initialize immediately if DOM already loaded
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
