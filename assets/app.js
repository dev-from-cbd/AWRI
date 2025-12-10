const state={authenticated:false,activeTag:null};
const signinBtn=document.getElementById('signinBtn');
const navItems=[...document.querySelectorAll('[data-requires-auth]')];
const filterDate=document.getElementById('filterDate');
const filterRegion=document.getElementById('filterRegion');
const filterArea=document.getElementById('filterArea');
const chartCards=[...document.querySelectorAll('.chart-card')];
const kbSearch=document.getElementById('kbSearch');
const tagButtons=[...document.querySelectorAll('.tag')];
const kbItems=[...document.querySelectorAll('.kb-list .list-item')];

function updateAuthUI(){
  const disabledClass='disabled';
  navItems.forEach(el=>{
    if(state.authenticated){
      el.classList.remove(disabledClass);
    }else{
      el.classList.add(disabledClass);
    }
  });
  document.querySelector('.auth-indicator span').textContent=state.authenticated?'Secure Access Granted':'Secure Access Required';
}

function filterCharts(){
  const d=filterDate.value;
  const r=filterRegion.value;
  const a=filterArea.value;
  chartCards.forEach(card=>{
    const matchDate=d==='all'||card.dataset.date===d;
    const matchRegion=r==='all'||card.dataset.region===r;
    const matchArea=a==='all'||card.dataset.area===a;
    const show=matchDate&&matchRegion&&matchArea;
    card.style.display=show?'block':'none';
  });
}

function applyTag(tag){
  state.activeTag=tag===state.activeTag?null:tag;
  tagButtons.forEach(b=>{
    const active=b.dataset.tag===state.activeTag;
    b.classList.toggle('active',active);
  });
  filterKB();
}

function filterKB(){
  const q=(kbSearch.value||'').toLowerCase();
  kbItems.forEach(item=>{
    const text=(item.querySelector('.list-title').textContent+' '+item.querySelector('.list-meta').textContent).toLowerCase();
    const tags=(item.dataset.tags||'').toLowerCase();
    const matchText=q===''||text.includes(q);
    const matchTag=!state.activeTag||tags.includes(state.activeTag);
    const show=matchText&&matchTag;
    item.style.display=show?'block':'none';
  });
}

signinBtn.addEventListener('click',()=>{
  state.authenticated=!state.authenticated;
  signinBtn.textContent=state.authenticated?'Sign Out':'Sign In';
  updateAuthUI();
});

[filterDate,filterRegion,filterArea].forEach(el=>{
  el.addEventListener('change',filterCharts);
});

kbSearch.addEventListener('input',filterKB);
tagButtons.forEach(b=>b.addEventListener('click',()=>applyTag(b.dataset.tag)));

updateAuthUI();
filterCharts();
filterKB();
