import { useState } from 'react';
import { getHoy, uid } from '../utils.js';
import { C, Btn, Campo, Input, Textarea, Modal, SectionHeader, EmptyState } from '../components/ui.jsx';

const HOY = getHoy();

function ModalMaloHabito({ mh, onGuardar, onClose }) {
  const [form, setForm] = useState({
    nombre: mh?.nombre || '',
    detonante: mh?.detonante || '',
    sustitucion: mh?.sustitucion || '',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Modal titulo={mh ? 'Editar hábito a romper' : 'Registrar hábito a romper'} onClose={onClose}>
      <div style={{
        background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)',
        borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#c08080',
      }}>
        Para romper un mal hábito: hazlo <strong>invisible</strong>, <strong>poco atractivo</strong>, <strong>difícil</strong> e <strong>insatisfactorio</strong>.
      </div>

      <Campo label="¿Qué hábito quieres eliminar?" required>
        <Input
          value={form.nombre}
          onChange={e => set('nombre', e.target.value)}
          placeholder="ej. Revisar el móvil al despertar"
        />
      </Campo>

      <Campo label="¿Cuál es el detonante? (¿qué lo provoca?)">
        <Input
          value={form.detonante}
          onChange={e => set('detonante', e.target.value)}
          placeholder="ej. Aburrimiento, estrés, llegar a casa"
        />
        <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
          Identificar el detonante es el primer paso para hacerlo invisible.
        </div>
      </Campo>

      <Campo label="Plan de sustitución (¿qué harás en su lugar?)">
        <Textarea
          value={form.sustitucion}
          onChange={e => set('sustitucion', e.target.value)}
          placeholder="ej. Cuando sienta el impulso, daré un paseo de 5 minutos o leeré una página"
        />
      </Campo>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="danger" disabled={!form.nombre.trim()} onClick={() => onGuardar(form)}>
          {mh ? 'Guardar cambios' : 'Registrar hábito'}
        </Btn>
      </div>
    </Modal>
  );
}

function MaloHabitoCard({ mh, onEditar, onEliminar, onRecaida }) {
  const [expandido, setExpandido] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const diasSin = Math.max(0, Math.round((new Date(HOY) - new Date(mh.inicioConteo || HOY)) / 86_400_000));
  const color = diasSin > 30 ? C.green : diasSin > 14 ? C.teal : diasSin > 7 ? C.yellow : diasSin > 0 ? C.orange : C.red;

  const handleRecaida = () => {
    if (confirmando) {
      onRecaida();
      setConfirmando(false);
    } else {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 4000);
    }
  };

  const getMensajeRacha = () => {
    if (diasSin === 0) return { texto: 'Hoy es el primer día. ¡Cada gran racha empieza aquí!', color: C.orange };
    if (diasSin === 1) return { texto: '¡Un día! No falles mañana — esa es la única regla.', color: C.orange };
    if (diasSin >= 30) return { texto: `¡Increíble! ${diasSin} días sin caer. Ya es parte de ti.`, color: C.green };
    if (diasSin >= 7) return { texto: `${diasSin} días. Lo estás haciendo genial 🌟`, color: C.yellow };
    return null;
  };

  const msg = getMensajeRacha();

  return (
    <div style={{
      background: '#131313', border: '1px solid #1e1414', borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '16px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Contador días */}
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#0f0f0f',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: `1px solid ${color}30`,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{diasSin}</span>
            <span style={{ fontSize: 9, color: '#555', marginTop: 1 }}>días</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>🚫 {mh.nombre}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
              Mejor racha: <strong style={{ color: '#888' }}>{mh.mejorRacha || 0}</strong> días
              {(mh.historialRecaidas || []).length > 0 &&
                ` · ${mh.historialRecaidas.length} recaída${mh.historialRecaidas.length > 1 ? 's' : ''}`}
            </div>
          </div>
          <span style={{ color: '#444', fontSize: 14 }}>{expandido ? '▲' : '▼'}</span>
        </div>

        {msg && (
          <div style={{
            marginTop: 10, padding: '8px 12px', background: `${msg.color}0d`,
            borderRadius: 8, fontSize: 13, color: msg.color,
          }}>
            {msg.texto}
          </div>
        )}
      </div>

      {expandido && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1a1a1a' }}>
          {mh.detonante && (
            <div style={{ fontSize: 13, color: '#777', marginBottom: 8 }}>
              ⚡ Detonante: {mh.detonante}
            </div>
          )}
          {mh.sustitucion && (
            <div style={{ fontSize: 13, color: '#4a7a5a', marginBottom: 12 }}>
              💡 En su lugar: {mh.sustitucion}
            </div>
          )}

          {/* Historial recaídas */}
          {(mh.historialRecaidas || []).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Historial de recaídas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {mh.historialRecaidas.slice(-5).map((f, i) => (
                  <span key={i} style={{
                    fontSize: 11, background: '#1a0f0f', color: '#f87171',
                    padding: '2px 8px', borderRadius: 6,
                  }}>
                    {f.split('-').reverse().join('/')}
                  </span>
                ))}
                {mh.historialRecaidas.length > 5 && (
                  <span style={{ fontSize: 11, color: '#555' }}>+{mh.historialRecaidas.length - 5} más</span>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn variant="danger" small onClick={handleRecaida}>
              {confirmando ? '⚠️ ¿Confirmar recaída?' : '😔 Registrar recaída'}
            </Btn>
            <Btn variant="ghost" small onClick={onEditar}>✏️ Editar</Btn>
            <Btn variant="secondary" small onClick={onEliminar}>🗑 Eliminar</Btn>
          </div>

          {confirmando && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
              No pasa nada. La clave es no fallar <strong>dos veces seguidas</strong>. ¿Registrar recaída?
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VistaMalosHabitos({ malosHabitos, setMalosHabitos }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const guardar = datos => {
    if (editando) {
      setMalosHabitos(prev => prev.map(h => h.id === editando.id ? { ...h, ...datos } : h));
    } else {
      setMalosHabitos(prev => [...prev, {
        ...datos, id: uid(),
        inicioConteo: HOY,
        mejorRacha: 0,
        historialRecaidas: [],
      }]);
    }
    setModal(false);
    setEditando(null);
  };

  const registrarRecaida = id => {
    setMalosHabitos(prev => prev.map(h => {
      if (h.id !== id) return h;
      const diasActuales = Math.max(0, Math.round((new Date(HOY) - new Date(h.inicioConteo || HOY)) / 86_400_000));
      return {
        ...h,
        mejorRacha: Math.max(h.mejorRacha || 0, diasActuales),
        historialRecaidas: [...(h.historialRecaidas || []), HOY],
        inicioConteo: HOY,
      };
    }));
  };

  const eliminar = id => {
    if (window.confirm('¿Eliminar este registro?')) {
      setMalosHabitos(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Hábitos a Romper</h1>
        <Btn variant="danger" onClick={() => { setEditando(null); setModal(true); }}>+ Añadir</Btn>
      </div>

      <div style={{
        background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.12)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c08080', lineHeight: 1.6,
      }}>
        💡 Las 4 leyes inversas: hazlo <strong>invisible</strong>, <strong>poco atractivo</strong>, <strong>difícil</strong> e <strong>insatisfactorio</strong>.
      </div>

      {malosHabitos.length === 0 ? (
        <EmptyState
          texto="No hay hábitos registrados aún"
          emoji="🎉"
          accion={<Btn variant="danger" onClick={() => setModal(true)}>Registrar hábito a romper</Btn>}
        />
      ) : (
        malosHabitos.map(mh => (
          <MaloHabitoCard
            key={mh.id}
            mh={mh}
            onEditar={() => { setEditando(mh); setModal(true); }}
            onEliminar={() => eliminar(mh.id)}
            onRecaida={() => registrarRecaida(mh.id)}
          />
        ))
      )}

      {modal && (
        <ModalMaloHabito
          mh={editando}
          onGuardar={guardar}
          onClose={() => { setModal(false); setEditando(null); }}
        />
      )}
    </div>
  );
}
