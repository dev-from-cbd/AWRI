// Define the application state object with authentication and navigation properties
const state = { authenticated: false, activeTag: null, activeMenu: null };
// Get the sign-in button element from the DOM
const signinBtn = document.getElementById('signinBtn');
// Select all navigation items that require authentication and convert to an array
const navItems = [...document.querySelectorAll('[data-requires-auth]')];
// Get the date filter dropdown element
const filterDate = document.getElementById('filterDate');
// Get the region filter dropdown element
const filterRegion = document.getElementById('filterRegion');
// Get the research area filter dropdown element
const filterArea = document.getElementById('filterArea');
// Select all chart card elements and convert to an array
const chartCards = [...document.querySelectorAll('.chart-card')];
// Get the knowledge base search input element
const kbSearch = document.getElementById('kbSearch');
// Select all tag filter buttons and convert to an array
const tagButtons = [...document.querySelectorAll('.tag')];
// Select all knowledge base list items and convert to an array
const kbItems = [...document.querySelectorAll('.kb-list .list-item')];
// Select all menu links and convert to an array
const menuLinks = [...document.querySelectorAll('.menu-link')];
// Select the brand bar element
const brandbar = document.querySelector('.brandbar');
// Define an object mapping menu keys to their corresponding mega menu elements
const megas = { rd: document.getElementById('mega-rd'), services: document.getElementById('mega-services'), affinity: document.getElementById('mega-affinity'), about: document.getElementById('mega-about') };
// Initialize a variable to store the hide timer ID
let hideTimer = null;
// Empty line for readability
// Function to position the mega menu below the brand bar
function positionMega(el) {
  // If brandbar or element is missing, exit the function
  if (!brandbar || !el) return;
  // Get the bounding rectangle of the brand bar
  const rect = brandbar.getBoundingClientRect();
  // Set the top position of the mega menu based on the brand bar's bottom edge
  el.style.setProperty('--mega-top', `${Math.round(rect.bottom)}px`);
// End of positionMega function
}
// Define an object mapping route keys to their corresponding page elements
const routes = {
  // Map 'home' key to the home page element
  home: document.getElementById('page-home'),
  // Map 'data-hub' key to the data hub page element
  'data-hub': document.getElementById('page-hub'),
  // Map 'notebooks' key to the notebooks page element
  notebooks: document.getElementById('page-notebooks'),
  // Map 'knowledge' key to the knowledge base page element
  knowledge: document.getElementById('page-knowledge'),
// End of routes object
};
// Get the generic page container element
const generic = document.getElementById('page-generic');
// Empty line for readability
// Function to update the authentication UI based on state
function updateAuthUI() {
  // Define the class name for disabled elements
  const disabledClass = 'disabled';
  // Iterate over each navigation item that requires auth
  navItems.forEach(el => {
    // Check if the user is authenticated
    if (state.authenticated) {
      // Remove the disabled class if authenticated
      el.classList.remove(disabledClass);
    // If not authenticated
    } else {
      // Add the disabled class
      el.classList.add(disabledClass);
    // End of if/else block
    }
  // End of forEach loop
  });
  // Select the authentication indicator text span
  const indicator = document.querySelector('.auth-indicator span');
  // Check if the indicator element exists
  if (indicator) {
    // Update the text content based on authentication state
    indicator.textContent = state.authenticated ? 'Secure Access Granted' : 'Secure Access Required';
  // End of if block
  }
// End of updateAuthUI function
}
// Empty line for readability
// Function to filter charts based on selected criteria
function filterCharts() {
  // Get the selected value from the date filter
  const d = filterDate.value;
  // Get the selected value from the region filter
  const r = filterRegion.value;
  // Get the selected value from the area filter
  const a = filterArea.value;
  // Iterate over each chart card
  chartCards.forEach(card => {
    // Check if the card matches the date filter (or if filter is 'all')
    const matchDate = d === 'all' || card.dataset.date === d;
    // Check if the card matches the region filter (or if filter is 'all')
    const matchRegion = r === 'all' || card.dataset.region === r;
    // Check if the card matches the area filter (or if filter is 'all')
    const matchArea = a === 'all' || card.dataset.area === a;
    // Determine if the card should be shown (all conditions match)
    const show = matchDate && matchRegion && matchArea;
    // Set the display style based on the show result
    card.style.display = show ? 'block' : 'none';
  // End of forEach loop
  });
// End of filterCharts function
}
// Empty line for readability
// Function to apply a tag filter
function applyTag(tag) {
  // Toggle the active tag: if same as current, set to null, otherwise set to new tag
  state.activeTag = tag === state.activeTag ? null : tag;
  // Iterate over each tag button
  tagButtons.forEach(b => {
    // Check if this button corresponds to the active tag
    const active = b.dataset.tag === state.activeTag;
    // Toggle the 'active' class on the button
    b.classList.toggle('active', active);
  // End of forEach loop
  });
  // Call the filterKB function to update the list
  filterKB();
// End of applyTag function
}
// Empty line for readability
// Function to filter knowledge base items
function filterKB() {
  // Get the search query, convert to lowercase, or use empty string
  const q = (kbSearch.value || '').toLowerCase();
  // Iterate over each knowledge base item
  kbItems.forEach(item => {
    // Get the text content (title + meta) and convert to lowercase
    const text = (item.querySelector('.list-title').textContent + ' ' + item.querySelector('.list-meta').textContent).toLowerCase();
    // Get the tags data attribute and convert to lowercase
    const tags = (item.dataset.tags || '').toLowerCase();
    // Check if the text includes the search query (or if query is empty)
    const matchText = q === '' || text.includes(q);
    // Check if the item has the active tag (or if no tag is active)
    const matchTag = !state.activeTag || tags.includes(state.activeTag);
    // Determine if the item should be shown
    const show = matchText && matchTag;
    // Set the display style based on the show result
    item.style.display = show ? 'block' : 'none';
  // End of forEach loop
  });
// End of filterKB function
}
// Empty line for readability
// Function to set the active menu
function setMenu(key) {
  // Update the state with the new active menu key
  state.activeMenu = key;
  // Iterate over the mega menus object entries
  Object.entries(megas).forEach(([k, el]) => {
    // Check if this menu key matches the active menu
    const on = k === state.activeMenu;
    // Toggle the 'show' class on the menu element
    el.classList.toggle('show', on);
    // If the menu is active, position it
    if (on) positionMega(el);
  // End of forEach loop
  });
  // Update the active state of menu links
  menuLinks.forEach(b => b.classList.toggle('active', b.dataset.menu === state.activeMenu));
// End of setMenu function
}
// Empty line for readability
// Function to hide all menus
function hideMenus() {
  // Reset the active menu state to null
  state.activeMenu = null;
  // Remove the 'show' class from all mega menus
  Object.values(megas).forEach(el => el.classList.remove('show'));
  // Remove the 'active' class from all menu links
  menuLinks.forEach(b => b.classList.remove('active'));
// End of hideMenus function
}
// Empty line for readability
// Function to show a specific route/page
function showRoute(key) {
  // Get the route element from the routes object
  const known = routes[key];
  // Remove the 'active' class from all route elements
  Object.values(routes).forEach(el => el && el.classList.remove('active'));
  // Check if the route is known/exists
  if (known) {
    // Add the 'active' class to the known route element
    known.classList.add('active');
    // Remove the 'active' class from the generic page
    generic.classList.remove('active');
  // If the route is not known
  } else {
    // Create a title from the key (replace hyphens with spaces and uppercase)
    const title = key.replace(/-/g, ' ').toUpperCase();
    // Set the content of the generic page
    generic.innerHTML = `<h2>${title}</h2><p>Антарктический раздел в разработке. Содержимое появится скоро.</p>`;
    // Add the 'active' class to the generic page
    generic.classList.add('active');
  // End of if/else block
  }
// End of showRoute function
}
// Empty line for readability
// Function to initialize routing based on URL hash
function initRouting() {
  // Get the key from the location hash or default to 'home'
  const key = (location.hash || '#home').slice(1);
  // Show the route for the key
  showRoute(key);
  // Add an event listener for hash changes
  window.addEventListener('hashchange', () => {
    // Get the new key from the location hash or default to 'home'
    const k = (location.hash || '#home').slice(1);
    // Show the route for the new key
    showRoute(k);
  // End of event listener
  });
// End of initRouting function
}
// Empty line for readability
// Check if the sign-in button exists
if (signinBtn) {
  // Add a click event listener to the sign-in button
  signinBtn.addEventListener('click', () => {
    // Toggle the authenticated state
    state.authenticated = !state.authenticated;
    // Update the button text based on the new state
    signinBtn.textContent = state.authenticated ? 'Sign Out' : 'Sign In';
    // Update the UI to reflect the authentication state
    updateAuthUI();
  // End of event listener
  });
// End of if block
}
// Empty line for readability
// Filter valid filter elements and add change event listeners
[filterDate, filterRegion, filterArea].filter(Boolean).forEach(el => {
  // Add 'change' event listener to call filterCharts
  el.addEventListener('change', filterCharts);
// End of forEach loop
});
// Empty line for readability
// Check if the knowledge base search input exists
if (kbSearch) {
  // Add 'input' event listener to call filterKB
  kbSearch.addEventListener('input', filterKB);
// End of if block
}
// Add click event listeners to tag buttons to apply tags
tagButtons.forEach(b => b.addEventListener('click', () => applyTag(b.dataset.tag)));
// Iterate over each menu link to add hover and click events
menuLinks.forEach(b => {
  // Get the menu key from the dataset
  const key = b.dataset.menu;
  // Check if key exists, mega menu exists, and it's not 'affinity'
  if (key && megas[key] && key !== 'affinity') {
    // Add mouseenter event to show the menu
    b.addEventListener('mouseenter', () => setMenu(key));
  // End of if block
  }
  // Check if it's a button, key exists, mega menu exists, and not 'affinity'
  if (b.tagName === 'BUTTON' && key && megas[key] && key !== 'affinity') {
    // Add click event to show the menu
    b.addEventListener('click', () => setMenu(key));
  // End of if block
  }
  // Check if it's a link (A tag), key exists, mega menu exists, and not 'affinity'
  if (b.tagName === 'A' && key && megas[key] && key !== 'affinity') {
    // Add click event listener
    b.addEventListener('click', (e) => {
      // Prevent default link behavior
      e.preventDefault();
      // Show the menu
      setMenu(key);
    // End of event listener
    });
  // End of if block
  }
// End of forEach loop
});
// Add a global click event listener to hide menus when clicking outside
document.addEventListener('click', e => {
  // Check if the click was inside a mega menu or the main nav
  const inside = e.target.closest('.mega') || e.target.closest('.mainnav');
  // If not inside, hide the menus
  if (!inside) hideMenus();
// End of event listener
});
// Empty line for readability
// Function to check if the pointer is over a navigation element
function isPointerOverNav(target) {
  // If no target, return false
  if (!target) return false;
  // Return true if target is within mega, mainnav, or brandbar
  return !!(target.closest('.mega') || target.closest('.mainnav') || target.closest('.brandbar'));
// End of isPointerOverNav function
}
// Empty line for readability
// Check if the brand bar exists
if (brandbar) {
  // Add mouseleave event listener to the brand bar
  brandbar.addEventListener('mouseleave', e => {
    // Get the element the pointer moved to
    const to = e.relatedTarget;
    // If moving to a mega menu, do nothing (return)
    if (to && to.closest('.mega')) return;
    // Clear any existing hide timer
    clearTimeout(hideTimer);
    // Set a timeout to hide menus after a delay
    hideTimer = setTimeout(() => {
      // Check if the pointer is currently over a mega menu
      const overMega = document.querySelector(':hover') && document.querySelector(':hover').closest('.mega');
      // If not over a mega menu, hide the menus
      if (!overMega) hideMenus();
    // Delay of 140ms
    }, 140);
  // End of event listener
  });
  // Add mouseenter event to clear the hide timer
  brandbar.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
// End of if block
}
// Empty line for readability
// Iterate over existing mega menu elements
Object.values(megas).filter(Boolean).forEach(el => {
  // Add mouseenter event to clear the hide timer
  el.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
  // Add mouseleave event to hide menus with a delay
  el.addEventListener('mouseleave', e => {
    // Get the element the pointer moved to
    const to = e.relatedTarget;
    // If moving to another nav element, do nothing
    if (to && (to.closest('.mega') || to.closest('.mainnav') || to.closest('.brandbar'))) return;
    // Clear any existing hide timer
    clearTimeout(hideTimer);
    // Set a timeout to hide menus after 140ms
    hideTimer = setTimeout(() => hideMenus(), 140);
  // End of event listener
  });
// End of forEach loop
});
// Empty line for readability
// Robust auto-hide when pointer leaves all menu areas
window.addEventListener('mousemove', e => {
  // Check if pointer is NOT over a nav element
  if (!isPointerOverNav(e.target)) {
    // Clear existing timer
    clearTimeout(hideTimer);
    // Set timer to hide menus after 160ms
    hideTimer = setTimeout(() => hideMenus(), 160);
  // If pointer IS over a nav element
  } else {
    // Clear the hide timer if it exists
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  // End of if/else block
  }
// End of event listener
});
// Add mouseleave event to window to hide menus immediately
window.addEventListener('mouseleave', () => hideMenus());
// Add keydown event to hide menus on Escape key
window.addEventListener('keydown', e => { if (e.key === 'Escape') hideMenus(); });
// Empty line for readability
// Add resize event listener to reposition the active menu
window.addEventListener('resize', () => {
  // If a menu is active, reposition it
  if (state.activeMenu) { positionMega(megas[state.activeMenu]); }
// End of event listener
});
// Add scroll event listener to reposition the active menu
window.addEventListener('scroll', () => {
  // If a menu is active, reposition it
  if (state.activeMenu) { positionMega(megas[state.activeMenu]); }
// End of event listener
});
// Empty line for readability
// Select the hero art element
const heroArt = document.querySelector('.hero-art');
// Initialize parallax tick flag
let parallaxTick = false;
// Base parallax offset (more grapes visible)
const PARALLAX_BASE = -80;  // базовое смещение: больше винограда в кадре
// Minimum parallax offset
const PARALLAX_MIN = -260;  // нижний предел (не уходить слишком вверх)
// Maximum parallax offset
const PARALLAX_MAX = -40;   // верхний предел (не опускать слишком вниз)
// Function to apply parallax effect
function applyParallax() {
  // If hero art element is missing, exit
  if (!heroArt) return;
  // Get current scroll position
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  // Calculate raw offset based on scroll position
  const raw = PARALLAX_BASE - Math.round(y * 0.25);
  // Clamp the offset between min and max values
  const clamped = Math.max(PARALLAX_MIN, Math.min(PARALLAX_MAX, raw));
  // Apply the background position style
  heroArt.style.backgroundPosition = `center ${clamped}px`;
// End of applyParallax function
}
// Add scroll event listener for parallax effect
window.addEventListener('scroll', () => {
  // If not already ticking
  if (!parallaxTick) {
    // Set tick flag
    parallaxTick = true;
    // Request animation frame to apply parallax
    requestAnimationFrame(() => { applyParallax(); parallaxTick = false; });
  // End of if block
  }
// End of event listener
});
// Apply parallax initially
applyParallax();
// Empty line for readability
// Initial call to update authentication UI
updateAuthUI();
// Initial call to filter charts
filterCharts();
// Initial call to filter knowledge base
filterKB();
// Initial call to initialize routing
initRouting();
// Empty line for readability
// Function to initialize news carousels
function initNewsCarousels() {
  // Select all news carousel wrappers
  const wrappers = document.querySelectorAll('.news-carousel-wrapper');
  // Iterate over each wrapper
  wrappers.forEach(wrapper => {
    // Select the container element
    const container = wrapper.querySelector('.news-carousel-container');
    // Select the list element
    const list = wrapper.querySelector('.news-list');
    // Select the previous button
    const prevBtn = wrapper.querySelector('.news-nav-prev');
    // Select the next button
    const nextBtn = wrapper.querySelector('.news-nav-next');
    // If any required element is missing, return
    if (!container || !list || !prevBtn || !nextBtn) return;
    // Initialize carousel state
    const state = { itemsPerView: 1, totalItems: list.querySelectorAll('.news-item').length, currentIndex: 0, step: 0, maxScroll: 0 };
    // Function to update items per view based on screen width
    function updateItemsPerView() {
      // Set items per view: 1 for mobile, 2.5 for desktop
      state.itemsPerView = window.innerWidth < 900 ? 1 : 2.5;
      // Select the first item to measure
      const firstItem = list.querySelector('.news-item');
      // If no item, return
      if (!firstItem) return;
      // Get the gap between items
      const gap = parseInt(window.getComputedStyle(list).gap) || 18;
      // Calculate step size (item width + gap)
      state.step = firstItem.offsetWidth + gap;
      // Calculate maximum scroll distance
      state.maxScroll = Math.max(0, list.scrollWidth - container.clientWidth);
      // Calculate maximum index
      const maxIndex = Math.ceil(state.maxScroll / (state.step || 1));
      // Clamp current index to max index
      if (state.currentIndex > maxIndex) state.currentIndex = maxIndex;
      // Scroll to the current index (no animation)
      scrollToIndex(state.currentIndex, false);
    // End of updateItemsPerView function
    }
    // Function to update button states
    function updateButtons() {
      // Check if at the start
      const atStart = state.currentIndex <= 0;
      // Check if at the end
      const atEnd = (state.currentIndex * state.step) >= (state.maxScroll - 1);
      // Enable/disable previous button
      prevBtn.disabled = atStart;
      // Enable/disable next button
      nextBtn.disabled = atEnd;
    // End of updateButtons function
    }
    // Function to scroll to a specific index
    function scrollToIndex(index, animate) {
      // Calculate scroll amount
      const amount = Math.min(index * (state.step || 0), state.maxScroll);
      // Set transition style if animating
      list.style.transition = animate ? 'transform 0.4s ease' : 'none';
      // Apply transform to scroll
      list.style.transform = `translateX(-${amount}px)`;
      // Update button states
      updateButtons();
    // End of scrollToIndex function
    }
    // Function to scroll to previous item
    function scrollPrev() {
      // If not at start
      if (state.currentIndex > 0) {
        // Decrement index
        state.currentIndex = Math.max(0, state.currentIndex - 1);
        // Scroll to new index with animation
        scrollToIndex(state.currentIndex, true);
      // End of if block
      }
    // End of scrollPrev function
    }
    // Function to scroll to next item
    function scrollNext() {
      // Calculate visible full items
      const visibleFullItems = Math.floor(state.itemsPerView);
      // Calculate max index
      const maxIndex = Math.max(0, state.totalItems - visibleFullItems);
      // If not at end
      if (state.currentIndex < maxIndex) {
        // Increment index
        state.currentIndex = Math.min(maxIndex, state.currentIndex + 1);
        // Scroll to new index with animation
        scrollToIndex(state.currentIndex, true);
      // End of if block
      }
    // End of scrollNext function
    }
    // Show previous button
    prevBtn.style.display = 'flex';
    // Show next button
    nextBtn.style.display = 'flex';
    // Add click listener to previous button
    prevBtn.addEventListener('click', scrollPrev);
    // Add click listener to next button
    nextBtn.addEventListener('click', scrollNext);
    // Initialize resize timer
    let resizeTimer;
    // Add resize event listener
    window.addEventListener('resize', () => {
      // Clear existing timer
      clearTimeout(resizeTimer);
      // Set timeout to update layout after resize ends
      resizeTimer = setTimeout(() => {
        // Update items per view
        updateItemsPerView();
        // Update buttons
        updateButtons();
      // Delay of 250ms
      }, 250);
    // End of event listener
    });
    // Initial call to update items per view
    updateItemsPerView();
    // Initial call to update buttons
    updateButtons();
  // End of forEach loop
  });
// End of initNewsCarousels function
}
// Check if document is still loading
if (document.readyState === 'loading') {
  // Add DOMContentLoaded listener to initialize carousels
  document.addEventListener('DOMContentLoaded', () => initNewsCarousels());
// If already loaded
} else {
  // Initialize carousels immediately
  initNewsCarousels();
// End of if/else block
}
// Empty line for readability
// Prevent single-word widows in news titles by binding the last two words
function preventTitleWidows() {
  // Select all news title elements
  const titles = document.querySelectorAll('.news-title');
  // Iterate over each title
  titles.forEach(el => {
    // Get text content and trim whitespace
    const text = (el.textContent || '').trim();
    // Replace the last space with a non-breaking space
    el.textContent = text.replace(/\s+([^\s]+)$/, '\u00A0$1');
  // End of forEach loop
  });
// End of preventTitleWidows function
}
// Check if document is still loading
if (document.readyState === 'loading') {
  // Add DOMContentLoaded listener to prevent widows
  document.addEventListener('DOMContentLoaded', preventTitleWidows);
// If already loaded
} else {
  // Prevent widows immediately
  preventTitleWidows();
// End of if/else block
}
