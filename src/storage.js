// En producción lee/escribe via /api/data (servidor Node).
// En desarrollo sin servidor cae a localStorage.

let cache = null; // null = no inicializado, {} = vacío

export const storage = {
  /** Carga todos los datos del servidor una sola vez. Llamar antes de renderizar la app. */
  async init() {
    try {
      const res = await fetch('/api/data');
      cache = res.ok ? await res.json() : {};
    } catch {
      cache = {};
    }
    return cache;
  },

  /** Lectura síncrona (solo después de init). */
  getItem(key) {
    if (cache !== null) return cache[key] ?? null;
    try { return localStorage.getItem(key); } catch { return null; }
  },

  /** Escritura: actualiza caché local + persiste en servidor (async, fire-and-forget). */
  setItem(key, value) {
    if (cache !== null) cache[key] = value;
    try { localStorage.setItem(key, value); } catch {}
    fetch(`/api/data/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    }).catch(() => {});
  },
};
