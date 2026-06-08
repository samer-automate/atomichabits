import { useState } from 'react';
import { DIAS_C, getHoy, getDow, calcularRacha, uid } from '../utils.js';
import { C, Btn, Campo, Input, Textarea, Modal, SectionHeader, EmptyState } from '../components/ui.jsx';

const HOY = getHoy();
const HOY_DOW = getDow(HOY);

const EMOJIS = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '😴', '🥗', '✍️', '🎯', '🎸', '💻', '🌅', '🦷', '🧠', '💊', '🚰', '📖', '🎨', '🏊', '🚴', '🤸'];

function ModalHabito({ habito, habitos, onGuardar, onClose }) {
  const [form, setForm] = useState({
    nombre: habito?.nombre || '',
    emoji: habito?.emoji || '⭐',
    identidad: habito?.identidad || '',
    frecuencia: habito?.frecuencia || 'diaria',
    diasSemana: habito?.diasSemana || [],
    versionDosMinutos: habito?.versionDosMinutos || '',
    despuesDe: habito?.despuesDe || '',
    ley: habito?.ley || 'obvio',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleDia = dow => set('diasSemana',
    form.diasSemana.includes(dow)
      ? form.diasSemana.filter(d => d !== dow)
      : [...form.diasSemana, dow]
  );

  const LEYES = [
    { id: 'obvio', label: 'Hazlo obvio', emoji: '👁️' },
    { id: 'atractivo', label: 'Hazlo atractivo', emoji: '✨' },
    { id: 'facil', label: 'Hazlo fácil', emoji: '🎯' },
    { id: 'satisfactorio', label: 'Hazlo satisfactorio', emoji: '🏆' },
  ];

  return (
    <Modal titulo={habito ? 'Editar hábito' : 'Nuevo hábito'} onClose={onClose} size="lg">
      {/* Emoji */}
      <Campo label="Elige un emoji">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => set('emoji', e)} style={{
              width: 40, height: 40, borderRadius: 8, border: 'none', background: form.emoji === e ? '#1e3a1e' : '#111',
              fontSize: 20, cursor: 'pointer', transition: 'all 0.2s',
              outline: form.emoji === e ? `2px solid ${C.green}` : 'none',
            }}>{e}</button>
          ))}
        </div>
      </Campo>

      <Campo label="Nombre del hábito" required>
        <Input
          value={form.nombre}
          onChange={e => set('nombre', e.target.value)}
          placeholder="ej. Meditar 10 minutos"
        />
      </Campo>

      <Campo label="Identidad que refuerza (hábito basado en identidad)">
        <Input
          value={form.identidad}
          onChange={e => set('identidad', e.target.value)}
          placeholder='ej. "Soy una persona que cuida su mente"'
        />
        <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
          Cada vez que cumplas este hábito, votas por esta versión de ti.
        </div>
      </Campo>

      <Campo label="Frecuencia">
        <div style={{ display: 'flex', gap: 8, marginBottom: form.frecuencia === 'semanal' ? 10 : 0 }}>
          {['diaria', 'semanal'].map(f => (
            <button key={f} onClick={() => set('frecuencia', f)} style={{
              flex: 1, padding: 10, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14,
              background: form.frecuencia === f ? '#1e3a1e' : '#111',
              color: form.frecuencia === f ? C.green : '#888',
              fontWeight: form.frecuencia === f ? 700 : 400,
              outline: form.frecuencia === f ? `1px solid ${C.green}` : 'none',
              transition: 'all 0.2s',
            }}>
              {f === 'diaria' ? 'Todos los días' : 'Días específicos'}
            </button>
          ))}
        </div>
        {form.frecuencia === 'semanal' && (
          <div style={{ display: 'flex', gap: 4 }}>
            {DIAS_C.map((d, i) => (
              <button key={i} onClick={() => toggleDia(i)} style={{
                flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: form.diasSemana.includes(i) ? '#1e3a1e' : '#111',
                color: form.diasSemana.includes(i) ? C.green : '#666',
                fontSize: 12, fontWeight: form.diasSemana.includes(i) ? 700 : 400,
                outline: form.diasSemana.includes(i) ? `1px solid ${C.green}` : 'none',
              }}>{d}</button>
            ))}
          </div>
        )}
      </Campo>

      <Campo label="Una de las 4 leyes (enfoque de diseño)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {LEYES.map(l => (
            <button key={l.id} onClick={() => set('ley', l.id)} style={{
              padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: form.ley === l.id ? '#1e3a1e' : '#111',
              color: form.ley === l.id ? C.green : '#777',
              fontSize: 12, textAlign: 'left',
              outline: form.ley === l.id ? `1px solid ${C.green}` : 'none',
              transition: 'all 0.2s',
            }}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>
      </Campo>

      <Campo label="Versión de 2 minutos (para los días difíciles)">
        <Input
          value={form.versionDosMinutos}
          onChange={e => set('versionDosMinutos', e.target.value)}
          placeholder="ej. Solo leer 1 página"
        />
        <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
          La regla de los 2 minutos: si el hábito parece imposible, ¿cuál es su versión mínima?
        </div>
      </Campo>

      <Campo label="Apilar después de (habit stacking)">
        <Input
          value={form.despuesDe}
          onChange={e => set('despuesDe', e.target.value)}
          placeholder="ej. Después de prepararme el café..."
        />
        <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
          "Después de [HÁBITO ACTUAL], haré [ESTE HÁBITO]."
        </div>
      </Campo>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn disabled={!form.nombre.trim()} onClick={() => onGuardar(form)}>
          {habito ? 'Guardar cambios' : 'Crear hábito'}
        </Btn>
      </div>
    </Modal>
  );
}

function HabitoCard({ habito, racha, completadoHoy, onEditar, onEliminar }) {
  const [expandido, setExpandido] = useState(false);

  const LEYES_LABEL = {
    obvio: '👁️ Obvio',
    atractivo: '✨ Atractivo',
    facil: '🎯 Fácil',
    satisfactorio: '🏆 Satisfactorio',
  };

  return (
    <div style={{
      background: '#131313',
      border: `1px solid ${completadoHoy ? 'rgba(74,222,128,0.2)' : '#1e1e1e'}`,
      borderRadius: 14, marginBottom: 10, overflow: 'hidden',
    }}>
      <div
        onClick={() => setExpandido(!expandido)}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: 10, background: '#0f0f0f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, border: completadoHoy ? `1px solid ${C.green}40` : '1px solid #1a1a1a',
          flexShrink: 0,
        }}>
          {habito.emoji || '⭐'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{habito.nombre}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
            {habito.frecuencia === 'diaria' ? 'Todos los días' : (habito.diasSemana || []).map(d => DIAS_C[d]).join(', ') || 'Sin días'}
            {habito.ley && <span style={{ marginLeft: 8, color: '#3a6a3a' }}>{LEYES_LABEL[habito.ley]}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {racha > 0 && (
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: racha >= 21 ? C.orange : racha >= 7 ? C.yellow : '#888',
            }}>🔥 {racha}</div>
          )}
          {completadoHoy && <div style={{ fontSize: 11, color: C.green, marginTop: 2 }}>✓ hoy</div>}
        </div>
      </div>

      {expandido && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #1a1a1a' }}>
          {habito.identidad && (
            <div style={{ fontSize: 13, color: '#4a7a5a', marginBottom: 6, fontStyle: 'italic' }}>
              🎯 "{habito.identidad}"
            </div>
          )}
          {habito.despuesDe && (
            <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
              🔗 Apilar tras: <em>{habito.despuesDe}</em>
            </div>
          )}
          {habito.versionDosMinutos && (
            <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
              ⏱ 2 minutos: {habito.versionDosMinutos}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" small onClick={onEditar}>✏️ Editar</Btn>
            <Btn variant="danger" small onClick={onEliminar}>🗑 Eliminar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VistaHabitos({ habitos, setHabitos, registros }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const guardar = datos => {
    if (editando) {
      setHabitos(prev => prev.map(h => h.id === editando.id ? { ...h, ...datos } : h));
    } else {
      setHabitos(prev => [...prev, { ...datos, id: uid(), creadoEn: HOY }]);
    }
    setModal(false);
    setEditando(null);
  };

  const eliminar = id => {
    if (window.confirm('¿Eliminar este hábito? Esta acción no se puede deshacer.')) {
      setHabitos(prev => prev.filter(h => h.id !== id));
    }
  };

  const abrirEditar = h => { setEditando(h); setModal(true); };
  const abrirNuevo = () => { setEditando(null); setModal(true); };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Mis Hábitos</h1>
        <Btn onClick={abrirNuevo}>+ Nuevo</Btn>
      </div>

      <div style={{
        background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#5a9a6a',
      }}>
        💡 Para crear buenos hábitos: hazlos obvios, atractivos, fáciles y satisfactorios.
      </div>

      {habitos.length === 0 ? (
        <EmptyState
          texto="Aún no tienes hábitos. ¡Crea el primero!"
          emoji="🌱"
          accion={<Btn onClick={abrirNuevo}>Crear mi primer hábito</Btn>}
        />
      ) : (
        habitos.map(h => (
          <HabitoCard
            key={h.id}
            habito={h}
            racha={calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)}
            completadoHoy={!!registros[HOY]?.habitos?.[h.id]}
            onEditar={() => abrirEditar(h)}
            onEliminar={() => eliminar(h.id)}
          />
        ))
      )}

      {modal && (
        <ModalHabito
          habito={editando}
          habitos={habitos}
          onGuardar={guardar}
          onClose={() => { setModal(false); setEditando(null); }}
        />
      )}
    </div>
  );
}
