// ═══════════════════════════════════════════
// POWER ONE PY — Supabase Client
// ═══════════════════════════════════════════
const SUPA_URL = 'https://oyhalszdnygmjztwmpni.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aGFsc3pkbnlnbWp6dHdtcG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTY2MTQsImV4cCI6MjA4ODMzMjYxNH0.aBBwiKab2JHd-Btg3_ZmOQl2TD4CCBwK81g7qzOMlrI';

const _h = { 'Content-Type': 'application/json', 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY };

const db = {
  // SELECT
  async get(table, opts = {}) {
    let url = `${SUPA_URL}/rest/v1/${table}?`;
    if (opts.select)  url += `select=${opts.select}&`;
    if (opts.eq)      Object.entries(opts.eq).forEach(([k,v]) => url += `${k}=eq.${encodeURIComponent(v)}&`);
    if (opts.order)   url += `order=${opts.order}&`;
    if (opts.limit)   url += `limit=${opts.limit}&`;
    if (opts.single)  url += `limit=1&`;
    const r = await fetch(url, { headers: { ..._h, 'Prefer': opts.single ? 'return=representation' : '' } });
    if (!r.ok) throw new Error(await r.text());
    const d = await r.json();
    return opts.single ? d[0] : d;
  },
  // INSERT
  async insert(table, data) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
      method: 'POST', headers: { ..._h, 'Prefer': 'return=representation' },
      body: JSON.stringify(Array.isArray(data) ? data : [data])
    });
    if (!r.ok) throw new Error(await r.text());
    const d = await r.json(); return d[0];
  },
  // UPDATE
  async update(table, id, data) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH', headers: { ..._h, 'Prefer': 'return=representation' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error(await r.text());
    const d = await r.json(); return d[0];
  },
  // UPSERT
  async upsert(table, data, onConflict = 'id') {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
      method: 'POST', headers: { ..._h, 'Prefer': 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify(Array.isArray(data) ? data : [data])
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  },
  // DELETE
  async delete(table, id) {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE', headers: _h
    });
    if (!r.ok) throw new Error(await r.text());
  },
  // RPC
  async rpc(fn, params = {}) {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST', headers: _h, body: JSON.stringify(params)
    });
    if (!r.ok) throw new Error(await r.text());
    return await r.json();
  }
};

// ─── AUTH (simple password stored in config table) ────────────────
const AUTH_KEY = 'popy_auth';
const auth = {
  async login(password) {
    const cfg = await db.get('config', { single: true });
    const stored = cfg?.admin_password || 'admin123';
    if (password !== stored) return false;
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
    return true;
  },
  logout() { localStorage.removeItem(AUTH_KEY); location.reload(); },
  isValid() {
    try {
      const s = JSON.parse(localStorage.getItem(AUTH_KEY));
      return s?.ok && (Date.now() - s.ts) < 30 * 24 * 60 * 60 * 1000;
    } catch { return false; }
  }
};
