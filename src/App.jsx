import { useState, useCallback } from 'react';
import { storage } from './storage.js';
import { getHoy, uid } from './utils.js';
import { C, ActionSheet, Modal, Input, Btn, Avatar } from './components/ui.jsx';
import { Icon } from './components/icons.jsx';
import VistaHoy from './views/VistaHoy.jsx';
import VistaHabitos from './views/VistaHabitos.jsx';
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

// Barra de navegación inferior: 4 pestañas + FAB central
function NavBar({ vistaActual, onCambiar, onFab }) {
  const items = [
    { id: 'hoy',     label: 'Hoy',     icon: 'calendar' },
    { id: 'habitos', label: 'Hábitos', icon: 'checkCircle' },
    { id: 'entrena', label: 'Entrena', icon: 'dumbbell' },
    { id: 'stats',   label: 'Stats',   icon: 'chart' },
  ];
  const izq = items.slice(0, 2);
  const der = items.slice(2);

  const Tab = ({ item }) => {
    const activo = vistaActual === item.id;
    return (
      <button onClick={() => onCambiar(item.id)} style={{
        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '8px 4px', gap: 4,
      }}>
        <Icon name={item.icon} size={23} color={activo ? C.amberDark : C.textFaint} strokeWidth={activo ? 2.2 : 1.9} />
        <span style={{ fontSize: 10, fontWeight: activo ? 700 : 500, color: activo ? C.text : C.textFaint }}>{item.label}</span>
      </button>
    );
  };

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: C.surface, boxShadow: '0 -4px 24px rgba(60,50,30,0.08)',
      display: 'flex', alignItems: 'center', zIndex: 200,
      maxWidth: 560, margin: '0 auto',
      padding: '6px 8px calc(6px + env(safe-area-inset-bottom, 0))',
      borderRadius: '22px 22px 0 0',
    }}>
      {izq.map(item => <Tab key={item.id} item={item} />)}

      {/* FAB central */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button onClick={onFab} style={{
          width: 58, height: 58, borderRadius: '50%', background: C.amber,
          border: '4px solid ' + C.surface, cursor: 'pointer', boxShadow: C.shadowLg, marginTop: -30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="plus" size={26} color={C.ink} strokeWidth={2.4} /></button>
      </div>

      {der.map(item => <Tab key={item.id} item={item} />)}
    </nav>
  );
}

// Modal para fijar/editar el nombre del perfil
function ModalNombre({ nombreInicial, onGuardar, onClose, primeraVez }) {
  const [nombre, setNombre] = useState(nombreInicial || '');
  return (
    <Modal titulo={primeraVez ? 'Bienvenido/a' : 'Tu nombre'} onClose={primeraVez ? () => {} : onClose} size="sm">
      <p style={{ fontSize: 14, color: C.textMut, marginBottom: 16 }}>
        ¿Cómo quieres que te salude la app?
      </p>
      <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" autoFocus
        onKeyDown={e => { if (e.key === 'Enter' && nombre.trim()) onGuardar(nombre.trim()); }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        {!primeraVez && <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>}
        <Btn disabled={!nombre.trim()} onClick={() => onGuardar(nombre.trim())}>Guardar</Btn>
      </div>
    </Modal>
  );
}

export default function App() {
  const [vista, setVista] = useState('hoy');
  const [modalSesionExterna, setModalSesionExterna] = useState(null);
  const [sheetAbierto, setSheetAbierto] = useState(false);

  // Todo el estado de la app persiste en storage
  const [perfil, setPerfil]                 = useStore('ah_perfil', { nombre: '' });
  const [habitos, setHabitos]               = useStore('ah_habitos', []);
  const [malosHabitos, setMalosHabitos]     = useStore('ah_malos', []);
  const [entrenamientos, setEntrenamientos] = useStore('ah_entrenamientos', []);
  const [sesiones, setSesiones]             = useStore('ah_sesiones', []);
  const [rutinas, setRutinas]               = useStore('ah_rutinas', {});
  const [registros, setRegistros]           = useStore('ah_registros', {});

  const [modalNombre, setModalNombre] = useState(false);
  // Señales para abrir modales desde el FAB en las vistas hijas
  const [accionPendiente, setAccionPendiente] = useState(null); // 'habito' | 'malo' | 'entreno'

  const handleRegistrarSesion = useCallback((entrenamiento) => {
    setModalSesionExterna(entrenamiento);
  }, []);

  const guardarSesionExterna = useCallback((datos) => {
    setSesiones(prev => [...prev, { ...datos, id: uid(), fecha: HOY }]);
    setModalSesionExterna(null);
  }, [setSesiones]);

  const necesitaNombre = !perfil?.nombre;

  // Opciones del FAB
  const opcionesFab = [
    { icon: 'star', color: C.sage, iconColor: C.success, label: 'Nuevo hábito', desc: 'Crear un buen hábito', onClick: () => { setVista('habitos'); setAccionPendiente({ tipo: 'habito', t: Date.now() }); } },
    { icon: 'dumbbell', color: C.amberSoft, iconColor: C.amberDark, label: 'Registrar entrenamiento', desc: 'Anotar una sesión', onClick: () => { setVista('entrena'); setAccionPendiente({ tipo: 'entreno', t: Date.now() }); } },
    { icon: 'ban', color: C.blush, iconColor: C.danger, label: 'Hábito a romper', desc: 'Algo que quieres dejar', onClick: () => { setVista('habitos'); setAccionPendiente({ tipo: 'malo', t: Date.now() }); } },
  ];

  const renderVista = () => {
    switch (vista) {
      case 'hoy':
        return (
          <VistaHoy
            perfil={perfil}
            onEditarNombre={() => setModalNombre(true)}
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
            malosHabitos={malosHabitos}
            setMalosHabitos={setMalosHabitos}
            accionPendiente={accionPendiente}
            limpiarAccion={() => setAccionPendiente(null)}
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
            accionPendiente={accionPendiente}
            limpiarAccion={() => setAccionPendiente(null)}
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
        :root { --text: ${C.text}; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; color: ${C.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="date"] { color-scheme: light; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sheetUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
      `}</style>

      <div
        key={vista}
        style={{
          maxWidth: 560, margin: '0 auto',
          padding: 'calc(64px + env(safe-area-inset-top, 0px)) 16px 96px', minHeight: '100vh',
          animation: 'fadeUp 0.2s ease',
        }}
      >
        {renderVista()}
      </div>

      <NavBar vistaActual={vista} onCambiar={setVista} onFab={() => setSheetAbierto(true)} />

      {sheetAbierto && (
        <ActionSheet
          titulo="¿Qué quieres hacer?"
          opciones={opcionesFab}
          onClose={() => setSheetAbierto(false)}
        />
      )}

      {modalSesionExterna && (
        <ModalSesion
          plan={modalSesionExterna}
          onGuardar={guardarSesionExterna}
          onClose={() => setModalSesionExterna(null)}
        />
      )}

      {(modalNombre || necesitaNombre) && (
        <ModalNombre
          primeraVez={necesitaNombre}
          nombreInicial={perfil?.nombre}
          onGuardar={(n) => { setPerfil({ ...perfil, nombre: n }); setModalNombre(false); }}
          onClose={() => setModalNombre(false)}
        />
      )}
    </>
  );
}
