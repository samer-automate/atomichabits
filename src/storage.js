// Capa de almacenamiento persistente
// Usa window.storage si está disponible (artifacts de Claude),
// si no, crea un objeto compatible sobre localStorage.

const createStorage = () => {
  if (typeof window !== 'undefined' && window.storage && typeof window.storage.getItem === 'function') {
    return window.storage;
  }
  // Polyfill sobre localStorage para entorno de navegador estándar
  return {
    getItem: (key) => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    setItem: (key, value) => {
      try { localStorage.setItem(key, value); } catch {}
    },
    removeItem: (key) => {
      try { localStorage.removeItem(key); } catch {}
    },
  };
};

export const storage = createStorage();

export function useStore(clave, valorInicial) {
  // Se usa dentro de App.jsx a través de useState + useEffect
  const leer = () => {
    try {
      const v = storage.getItem(clave);
      return v != null ? JSON.parse(v) : valorInicial;
    } catch {
      return valorInicial;
    }
  };

  const escribir = (valor) => {
    try {
      storage.setItem(clave, JSON.stringify(valor));
    } catch {}
  };

  return { leer, escribir };
}
