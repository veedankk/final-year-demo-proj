document.addEventListener('DOMContentLoaded', function(){
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('navToggle');

  btn.addEventListener('click', () => {
    const shown = getComputedStyle(nav).display !== 'none';
    if(shown){
      nav.style.display = 'none';
      btn.setAttribute('aria-expanded','false');
    } else {
      nav.style.display = 'block';
      btn.setAttribute('aria-expanded','true');
    }
  });

  // close nav on escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      nav.style.display = 'none';
      btn.setAttribute('aria-expanded','false');
    }
  });

  // close nav when clicking outside on small screens
  document.addEventListener('click', (e) => {
    const navVisible = getComputedStyle(nav).display !== 'none';
    if(!navVisible) return;
    if(e.target === btn || nav.contains(e.target)) return;
    nav.style.display = 'none';
    btn.setAttribute('aria-expanded','false');
  });
});

// Simple SPA navigation + demo data
document.addEventListener('DOMContentLoaded', () => {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');

  function showPage(id){
    // If trying to access dashboard without authentication, redirect to login
    if(id === 'dashboard' && !document.body.classList.contains('is-authenticated')){
      id = 'login';
    }

    pages.forEach(p => p.classList.toggle('active', p.id === id));
    // if dashboard shown, refresh data
    if(id === 'dashboard') renderDashboard();

    // update active nav link
    navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === id));
  }

  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = a.dataset.target;
      showPage(target);
    });
  });

  // Registration/Login (simulated)
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  let currentUser = null;
  // simple users store persisted to localStorage: { username: { password } }
  const users = JSON.parse(localStorage.getItem('users') || '{}');

  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(registerForm);
  const username = String(data.get('username')).trim();
  const password = String(data.get('password'));
  if(!username || !password){ alert('Please provide username and password.'); return; }
  users[username] = { password };
  // persist users so login works after reload
  try{ localStorage.setItem('users', JSON.stringify(users)); }catch(err){ console.warn('Could not save users to localStorage', err); }
  showPage('home');
  alert('Registered. Please login to access the dashboard.');
  // hide sidebar/nav on small screens
  const sidebar = document.querySelector('.sidebar');
  const navEl = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  if(window.innerWidth < 1000){ if(sidebar) sidebar.style.display = 'none'; if(navEl) navEl.style.display = 'none'; if(navToggle) navToggle.setAttribute('aria-expanded','false'); }
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(loginForm);
    // validate against registered users
    const username = String(data.get('username')).trim();
    const password = String(data.get('password'));
    if(!users[username] || users[username].password !== password){
      alert('Invalid username or password');
      return;
    }
    currentUser = {username, location: 'All'};
  // mark authenticated and reveal auth-only nav items
  document.body.classList.add('is-authenticated');
  // ensure dashboard nav is shown as active
  showPage('dashboard');
  // render only active bands across all locations
  renderDashboard(true);
  document.getElementById('totalBands')?.focus();
  // hide sidebar/nav on small screens
  const sidebar = document.querySelector('.sidebar');
  const navEl = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  if(window.innerWidth < 1000){ if(sidebar) sidebar.style.display = 'none'; if(navEl) navEl.style.display = 'none'; if(navToggle) navToggle.setAttribute('aria-expanded','false'); }
  });

  // Mock data
  const allBands = Array.from({length:12}).map((_,i)=>({
    id: 'band-'+(i+1),
    location: ['North','South','East','West'][i%4],
    active: Math.random() > 0.5
  }));

  const allGuards = [
    {name:'Guard A',location:'North',active:true},
    {name:'Guard B',location:'North',active:false},
    {name:'Guard C',location:'South',active:true},
    {name:'Guard D',location:'East',active:true},
    {name:'Guard E',location:'West',active:false}
  ];

  const bandsList = document.getElementById('bandsList');
  const guardsList = document.getElementById('guardsList');
  const totalBandsEl = document.getElementById('totalBands');
  const activeBandsEl = document.getElementById('activeBands');
  const pressedListEl = document.getElementById('pressedList');
  const locationSelect = document.getElementById('locationSelect');

  let pressed = [];

  function renderDashboard(onlyActiveAll = false){
    let bands = [];
    if(onlyActiveAll){
      bands = allBands.filter(b=>b.active === true);
    } else {
      const loc = locationSelect.value;
      bands = allBands.filter(b=>b.location === loc);
    }
    bandsList.innerHTML = '';
    bands.forEach(b => {
      const el = document.createElement('div');
      el.className = 'band';
      el.innerHTML = `<div><strong>${b.id}</strong><div class="muted">${b.location}</div></div>`;
      const btn = document.createElement('button');
      btn.textContent = b.active ? 'Notify' : 'Notify (inactive)';
      btn.disabled = false;
      btn.addEventListener('click', ()=>{
        pressed.unshift({bandId: b.id, time: new Date().toLocaleTimeString(), location: b.location});
        if(pressed.length>10) pressed.pop();
        renderPressed();
      });
      el.appendChild(btn);
      bandsList.appendChild(el);
    });

  // summary
  totalBandsEl.textContent = bands.length;
  activeBandsEl.textContent = bands.filter(b=>b.active).length;

    // guards nearby
  const guardsNearby = onlyActiveAll ? allGuards.filter(g=>g.active) : allGuards.filter(g=>g.location===locationSelect.value && g.active);
    guardsList.innerHTML = '';
    guardsNearby.forEach(g=>{
      const li = document.createElement('li');
      li.textContent = g.name + ' — ' + g.location;
      guardsList.appendChild(li);
    });
  }

  function renderPressed(){
    pressedListEl.innerHTML = '';
    pressed.forEach(p=>{
      const el = document.createElement('div');
      el.className = 'band';
      el.innerHTML = `<div><strong>${p.bandId}</strong><div class="muted">${p.location} • ${p.time}</div></div>`;
      pressedListEl.appendChild(el);
    });
  }

  locationSelect?.addEventListener('change', renderDashboard);

  // initial page
  showPage('home');
});
