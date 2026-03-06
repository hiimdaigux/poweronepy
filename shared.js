// ═══════════════════════════════════════════
// POWER ONE PY — Shared utilities
// ═══════════════════════════════════════════

const SUPA_URL = 'https://oyhalszdnygmjztwmpni.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aGFsc3pkbnlnbWp6dHdtcG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTY2MTQsImV4cCI6MjA4ODMzMjYxNH0.aBBwiKab2JHd-Btg3_ZmOQl2TD4CCBwK81g7qzOMlrI';
const _SH = { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY };
window._DB = null;

// ─── DATA LOADER — reads from Supabase ─────
async function loadDB() {
  if (window._DB) return window._DB;
  try {
    const [products, categories, streaming, services, cfgArr] = await Promise.all([
      fetch(`${SUPA_URL}/rest/v1/products?active=eq.true&order=created_at.asc`, {headers:_SH}).then(r=>r.json()),
      fetch(`${SUPA_URL}/rest/v1/categories?order=name.asc`, {headers:_SH}).then(r=>r.json()),
      fetch(`${SUPA_URL}/rest/v1/streaming?active=eq.true&order=id.asc`, {headers:_SH}).then(r=>r.json()),
      fetch(`${SUPA_URL}/rest/v1/services?order=id.asc`, {headers:_SH}).then(r=>r.json()),
      fetch(`${SUPA_URL}/rest/v1/config?id=eq.1`, {headers:_SH}).then(r=>r.json()),
    ]);
    const cfg = cfgArr[0] || {};
    // Normalize product fields to match existing templates
    const prods = (products||[]).map(p => ({
      ...p, desc: p.description || '', img: p.img || ''
    }));
    window._DB = {
      products: prods,
      categories: categories || [],
      streaming: streaming || [],
      services: services || [],
      config: {
        wa: cfg.wa || '595981570126',
        city: cfg.city || 'Asunción, Paraguay',
        email: cfg.email || 'info@poweronepy.com',
        address: cfg.address || 'Asunción, Paraguay',
        hours: cfg.hours || 'Lun-Sáb 08:00 - 18:00',
        heroDesc: cfg.hero_desc || '',
        empresa: cfg.empresa || 'Power One Py',
        ruc: cfg.ruc || '',
        timbrado: cfg.timbrado || '',
      }
    };
  } catch(e) {
    console.warn('Supabase load failed, using defaults:', e.message);
    window._DB = defaultData();
  }
  return window._DB;
}

// ─── THEME ─────────────────────────────────
const THEMES = {
  yellow: {
    '--accent':    '#FFD600',
    '--accent-d':  '#F0C200',
    '--accent-rgb':'255,214,0',
    '--on-accent': '#0A0A0A',
    '--disc':      '#ff4d4d',
  },
  orange: {
    '--accent':    '#FF6B00',
    '--accent-d':  '#E55F00',
    '--accent-rgb':'255,107,0',
    '--on-accent': '#FFFFFF',
    '--disc':      '#ff4d4d',
  }
};

function applyTheme(name) {
  const t = THEMES[name] || THEMES.yellow;
  const r = document.documentElement;
  Object.entries(t).forEach(([k,v]) => r.style.setProperty(k, v));
  localStorage.setItem('popy_theme', name);
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === name);
  });
}

function initTheme() {
  const saved = localStorage.getItem('popy_theme') || 'yellow';
  applyTheme(saved);
}

// ─── PRICE CALC ────────────────────────────
function calcPrice(p) {
  const raw = p.price || '';
  const disc = parseFloat(p.discount) || 0;
  if (!disc || disc <= 0 || disc > 99) return { display: raw || 'Consultar', hasDisc: false };
  const clean = raw.replace(/\./g,'').replace(/,/g,'.');
  const m = clean.match(/\d+(\.\d+)?/);
  if (!m) return { display: raw, hasDisc: false };
  const num = parseFloat(m[0]);
  const result = Math.round(num * (1 - disc / 100));
  const suffix = raw.replace(/[\d.,\s]/g,'').trim();
  let formatted;
  if (raw.match(/\d{1,3}\.\d{3}/)) {
    formatted = result.toLocaleString('de-DE') + (suffix ? ' ' + suffix : '');
  } else if (raw.includes('$')) {
    formatted = '$ ' + result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    formatted = result + (suffix ? ' ' + suffix : '');
  }
  return { display: formatted, hasDisc: true };
}

// ─── WA LINK ───────────────────────────────
function waLink(p, db) {
  const wa = (db?.config?.wa) || '595981570126';
  const pc = calcPrice(p);
  const pt = pc.hasDisc ? `${pc.display} (antes ${p.price})` : (p.price || '');
  return `https://wa.me/${wa}?text=${encodeURIComponent('Hola! Me interesa: ' + p.name + (pt ? ' — ' + pt : ''))}`;
}

// ─── SCROLL REVEAL ─────────────────────────
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── TOAST ─────────────────────────────────
function showToast(msg, err = false) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast' + (err ? ' err' : '') + ' show';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = 'toast', 3200);
}

// ─── NAV HELPERS ───────────────────────────
function toggleMenu() { document.getElementById('navLinks')?.classList.toggle('open'); }
function closeMenu()  { document.getElementById('navLinks')?.classList.remove('open'); }

// ─── DEFAULT DATA ──────────────────────────
function defaultData() {
  return {
    products: [
      { id:1, name:'Auricular Bluetooth Pro', cat:'Electrónica', desc:'Auriculares inalámbricos con cancelación de ruido y 30hs de batería.', price:'150.000 Gs.', badge:'Nuevo', img:'', discount:'' },
      { id:2, name:'Teclado Mecánico RGB', cat:'Informática', desc:'Switches azules y retroiluminación RGB completa.', price:'280.000 Gs.', badge:'', img:'', discount:'15' },
      { id:3, name:'Autoradio 2DIN Android', cat:'Car Audio', desc:'Pantalla táctil, Android Auto, WiFi y GPS.', price:'450.000 Gs.', badge:'Hot', img:'', discount:'' },
    ],
    categories: [
      { id:1, name:'Electrónica', icon:'📱' },
      { id:2, name:'Informática', icon:'💻' },
      { id:3, name:'Car Audio', icon:'🚗' }
    ],
    services: [
      { id:1, icon:'🛡️', name:'Garantía de fábrica', desc:'Todos nuestros productos cuentan con garantía oficial.' },
      { id:2, icon:'🚚', name:'Envío a todo el país', desc:'Enviamos por encomienda a cualquier punto de Paraguay.' },
      { id:3, icon:'💬', name:'Asesoramiento personalizado', desc:'Te ayudamos a elegir el producto ideal.' },
      { id:4, icon:'💳', name:'Facilidades de pago', desc:'Transferencia, efectivo y cuotas sin interés.' },
    ],
    streaming: [
      { id:1, name:'Netflix', icon:'🎬', desc:'Plan estándar con anuncios o premium. HD/4K disponible.', price:'25.000 Gs.', combo: true },
      { id:2, name:'Disney+', icon:'🏰', desc:'Disney, Marvel, Star Wars, Pixar y National Geographic.', price:'22.000 Gs.', combo: true },
      { id:3, name:'HBO Max', icon:'👑', desc:'Series HBO, películas Warner y contenido exclusivo.', price:'22.000 Gs.', combo: true },
      { id:4, name:'Spotify', icon:'🎵', desc:'Música sin anuncios, descargas y calidad premium.', price:'15.000 Gs.', combo: true },
      { id:5, name:'YouTube Premium', icon:'▶️', desc:'Sin anuncios, YouTube Music y descarga de videos.', price:'18.000 Gs.', combo: true },
      { id:6, name:'Prime Video', icon:'📦', desc:'Series y películas Amazon originales en HD/4K.', price:'18.000 Gs.', combo: true },
      { id:7, name:'Paramount+', icon:'⭐', desc:'Contenido Paramount, CBS, MTV, Nickelodeon y más.', price:'18.000 Gs.', combo: true },
      { id:8, name:'Apple TV+', icon:'🍎', desc:'Series y películas exclusivas Apple Originals.', price:'20.000 Gs.', combo: true },
    ],
    config: {
      wa:'595981570126', city:'Asunción, Paraguay', email:'info@poweronepy.com',
      address:'Asunción, Paraguay', hours:'Lun-Sáb 08:00 - 18:00',
      heroDesc:'Tu destino de tecnología en Paraguay. Electrónica, informática y car audio al mejor precio del mercado.'
    }
  };
}
