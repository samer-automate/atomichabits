import { useState, useEffect } from 'react';
import { getHoy, uid } from '../utils.js';
import { C, Btn, Campo, Input, Textarea, Modal, EmptyState, Card, PASTEL_TEXT } from '../components/ui.jsx';

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
        background: C.surfaceAlt, borderRadius: 14, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: C.textMut, lineHeight: 1.6,
      }}>
        Para romper un mal hábito: hazlo <strong>invisible</strong>, <strong>poco atractivo</strong>, <strong>difícil</strong> e <strong>insatisfactorio</strong>.
      </div>

      <Campo label="¿Qué hábito quieres eliminar?" required>
        <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej. Revisar el móvil al despertar" />
      </Campo>

      <Campo label="¿Cuál es el detonante? (¿qué lo provoca?)">
        <Input value={form.detonante} onChange={e => set('detonante', e.target.value)} placeholder="ej. Aburrimiento, estrés, llegar a casa" />
        <div style={{ fontSize: 11, color: C.textMut, marginTop: 5 }}>
          Identificar el detonante es el primer paso para hacerlo invisible.
        </div>
      </Campo>

      <Campo label="Plan de sustitución (¿qué harás en su lugar?)">
        <Textarea value={form.sustitucion} onChange={e => set('sustitucion', e.target.value)} placeholder="ej. Cuando sienta el impulso, daré un paseo de 5 minutos o leeré una página" />
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
    if (diasSin === 0) return 'Hoy es el primer día. ¡Cada gran racha empieza aquí!';
    if (diasSin === 1) return '¡Un día! No falles mañana — esa es la única regla.';
    if (diasSin >= 30) return `¡Increíble! ${diasSin} días sin caer. Ya es parte de ti.`;
    if (diasSin >= 7) return `${diasSin} días. Lo estás haciendo genial 🌟`;
    return null;
  };

  const msg = getMensajeRacha();

  return (
    <Card style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '16px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: C.pink,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: PASTEL_TEXT[C.pink], lineHeight: 1 }}>{diasSin}</span>
            <span style={{ fontSize: 9, color: PASTEL_TEXT[C.pink], opacity: 0.7, marginTop: 1 }}>días</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>🚫 {mh.nombre}</div>
            <div style={{ fontSize: 12, color: C.textMut, marginTop: 3 }}>
              Mejor racha: <strong style={{ color: C.text }}>{mh.mejorRacha || 0}</strong> días
              {(mh.historialRecaidas || []).length > 0 &&
                ` · ${mh.historialRecaidas.length} recaída${mh.historialRecaidas.length > 1 ? 's' : ''}`}
            </div>
          </div>
          <span style={{ color: C.textFaint, fontSize: 14 }}>{expandido ? '▲' : '▼'}</span>
        </div>

        {msg && (
          <div style={{
            marginTop: 10, padding: '8px 12px', background: C.surfaceAlt,
            borderRadius: 10, fontSize: 13, color: diasSin >= 7 ? PASTEL_TEXT[C.sage] : C.streak,
          }}>
            {msg}
          </div>
        )}
      </div>

      {expandido && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.line}` }}>
          {mh.detonante && (
            <div style={{ fontSize: 13, color: C.textMut, marginBottom: 8, marginTop: 12 }}>
              ⚡ Detonante: {mh.detonante}
            </div>
          )}
          {mh.sustitucion && (
            <div style={{ fontSize: 13, color: PASTEL_TEXT[C.sage], marginBottom: 12 }}>
              💡 En su lugar: {mh.sustitucion}
            </div>
          )}

          {(mh.historialRecaidas || []).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: C.textMut, marginBottom: 6, fontWeight: 600 }}>
                Historial de recaídas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {mh.historialRecaidas.slice(-5).map((f, i) => (
                  <span key={i} style={{
                    fontSize: 11, background: C.pink, color: PASTEL_TEXT[C.pink],
                    padding: '2px 8px', borderRadius: 8,
                  }}>
                    {f.split('-').reverse().join('/')}
                  </span>
                ))}
                {mh.historialRecaidas.length > 5 && (
                  <span style={{ fontSize: 11, color: C.textMut }}>+{mh.historialRecaidas.length - 5} más</span>
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
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMut }}>
              No pasa nada. La clave es no fallar <strong>dos veces seguidas</strong>. ¿Registrar recaída?
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Componente embebible: el contenido de "Romper" dentro de Hábitos
export default function VistaMalosHabitos({ malosHabitos, setMalosHabitos, triggerNuevo }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  // Abrir modal de nuevo cuando cambia triggerNuevo (FAB)
  useEffect(() => {
    if (triggerNuevo) { setEditando(null); setModal(true); }
  }, [triggerNuevo]);

  const guardar = datos => {
    if (editando) {
      setMalosHabitos(prev => prev.map(h => h.id === editando.id ? { ...h, ...datos } : h));
    } else {
      setMalosHabitos(prev => [...prev, {
        ...datos, id: uid(), inicioConteo: HOY, mejorRacha: 0, historialRecaidas: [],
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
    <div>
      <div style={{
        background: C.surfaceAlt, borderRadius: 14, padding: '12px 16px', marginBottom: 16,
        fontSize: 13, color: C.textMut, lineHeight: 1.6,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <span>💡 Hazlo <strong>invisible</strong>, <strong>poco atractivo</strong>, <strong>difícil</strong> e <strong>insatisfactorio</strong>.</span>
        <Btn variant="danger" small onClick={() => { setEditando(null); setModal(true); }} style={{ flexShrink: 0 }}>+ Añadir</Btn>
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
        <ModalMaloHabito mh={editando} onGuardar={guardar} onClose={() => { setModal(false); setEditando(null); }} />
      )}
    </div>
  );
}
