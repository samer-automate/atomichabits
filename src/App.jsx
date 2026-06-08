import { useState, useCallback } from 'react';
import { storage } from './storage.js';
import { getHoy, uid } from './utils.js';
import { C } from './components/ui.jsx';
import VistaHoy from './views/VistaHoy.jsx';
import VistaHabitos from './views/VistaHabitos.jsx';
import VistaMalosHabitos from './views/VistaMalosHabitos.jsx';
import VistaEntrenamiento, { ModalSesion } from './views/VistaEntrenamiento.jsx';
import VistaEstadisticas from './views/VistaEstadisticas.jsx';

const HOY = getHoy();

// Hook de estado persistente que usa window.storage (o localStorage como fallback)
function useStore(clave, valorInicial) {
  const [estado, setEstadoRaw] = useState(() => {
    try {
      const v = storage.getItem(clave);
      return v != null ? JSON.parse(v) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  const setEstado = useCallback((actualizador) => {
    setEstadoRaw(prev => {
      const nuevo = typeof actualizador === 'function' ? actualizador(prev) : actualizador;
      try { storage.setItem(clave, JSON.stringify(nuevo)); } catch {}
      return nuevo;
    });
  }, [clave]);

  return [estado, setEstado];
}

// Barra de navegación inferior
function NavBar({ vistaActual, onCambiar }) {
  const items = [
    { id: 'hoy',     label: 'Hoy',     icon: '📅' },
    { id: 'habitos', label: 'Hábitos', icon: '✅' },
    { id: 'malos',   label: 'Romper',  icon: '🚫' },
    { id: 'entrena', label: 'Entrena', icon: '💪' },
    { id: 'stats',   label: 'Stats',   icon: '📊' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid #1a1a1a', display: 'flex', zIndex: 200,
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
    }}>
      {items.map(item => {
        const activo = vistaActual === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onCambiar(item.id)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 4px', gap: 3,
              transition: 'color 0.2s', position: 'relative',
              color: activo ? C.green : '#444',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activo ? 700 : 400 }}>{item.label}</span>
            {activo && (
              <div style={{
                position: 'absolute', bottom: 0, width: 24, height: 2,
                background: C.green, borderRadius: 2,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  const [vista, setVista] = useState('hoy');
  const [modalSesionExterna, setModalSesionExterna] = useState(null);

  // Todo el estado de la app persiste en storage
  const [habitos, setHabitos]               = useStore('ah_habitos', []);
  const [malosHabitos, setMalosHabitos]     = useStore('ah_malos', []);
  const [entrenamientos, setEntrenamientos] = useStore('ah_entrenamientos', []);
  const [sesiones, setSesiones]             = useStore('ah_sesiones', []);
  const [rutinas, setRutinas]               = useStore('ah_rutinas', {});
  const [registros, setRegistros]           = useStore('ah_registros', {});

  const handleRegistrarSesion = useCallback((entrenamiento) => {
    setModalSesionExterna(entrenamiento);
  }, []);

  const guardarSesionExterna = useCallback((datos) => {
    setSesiones(prev => [...prev, { ...datos, id: uid(), fecha: HOY }]);
    setModalSesionExterna(null);
  }, [setSesiones]);

  const renderVista = () => {
    switch (vista) {
      case 'hoy':
        return (
          <VistaHoy
            habitos={habitos}
            malosHabitos={malosHabitos}
            entrenamientos={entrenamientos}
            rutinas={rutinas}
            registros={registros}
            setRegistros={setRegistros}
            onRegistrarSesion={handleRegistrarSesion}
          />
        );
      case 'habitos':
        return (
          <VistaHabitos
            habitos={habitos}
            setHabitos={setHabitos}
            registros={registros}
          />
        );
      case 'malos':
        return (
          <VistaMalosHabitos
            malosHabitos={malosHabitos}
            setMalosHabitos={setMalosHabitos}
          />
        );
      case 'entrena':
        return (
          <VistaEntrenamiento
            entrenamientos={entrenamientos}
            setEntrenamientos={setEntrenamientos}
            sesiones={sesiones}
            setSesiones={setSesiones}
            habitos={habitos}
            rutinas={rutinas}
            setRutinas={setRutinas}
          />
        );
      case 'stats':
        return (
          <VistaEstadisticas
            habitos={habitos}
            registros={registros}
            sesiones={sesiones}
            malosHabitos={malosHabitos}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        :root { --text: #f0f0f0; --text2: #999; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        key={vista}
        style={{
          maxWidth: 560, margin: '0 auto',
          padding: '20px 16px 84px', minHeight: '100vh',
          animation: 'fadeUp 0.2s ease',
        }}
      >
        {renderVista()}
      </div>

      <NavBar vistaActual={vista} onCambiar={setVista} />

      {modalSesionExterna && (
        <ModalSesion
          plan={modalSesionExterna}
          onGuardar={guardarSesionExterna}
          onClose={() => setModalSesionExterna(null)}
        />
      )}
    </>
  );
}
