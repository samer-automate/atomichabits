import { useState, useEffect } from 'react';
import { DIAS_C, getHoy, calcularRacha, uid } from '../utils.js';
import { C, Btn, Campo, Input, Modal, EmptyState, Card, Segmented, PASTEL_TEXT } from '../components/ui.jsx';
import VistaMalosHabitos from './VistaMalosHabitos.jsx';

const HOY = getHoy();

const EMOJIS = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '😴', '🥗', '✍️', '🎯', '🎸', '💻', '🌅', '🦷', '🧠', '💊', '🚰', '📖', '🎨', '🏊', '🚴', '🤸'];

function ModalHabito({ habito, onGuardar, onClose }) {
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
    form.diasSemana.includes(dow) ? form.diasSemana.filter(d => d !== dow) : [...form.diasSemana, dow]
  );

  const LEYES = [
    { id: 'obvio', label: 'Hazlo obvio', emoji: '👁️' },
    { id: 'atractivo', label: 'Hazlo atractivo', emoji: '✨' },
    { id: 'facil', label: 'Hazlo fácil', emoji: '🎯' },
    { id: 'satisfactorio', label: 'Hazlo satisfactorio', emoji: '🏆' },
  ];

  const chip = (activo) => ({
    borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    background: activo ? C.ink : C.surfaceAlt,
    color: activo ? '#fff' : C.textMut,
  });

  return (
    <Modal titulo={habito ? 'Editar hábito' : 'Nuevo hábito'} onClose={onClose} size="lg">
      <Campo label="Elige un emoji">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => set('emoji', e)} style={{
              ...chip(form.emoji === e), width: 40, height: 40, fontSize: 20,
              background: form.emoji === e ? C.sage : C.surfaceAlt,
            }}>{e}</button>
          ))}
        </div>
      </Campo>

      <Campo label="Nombre del hábito" required>
        <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej. Meditar 10 minutos" />
      </Campo>

      <Campo label="Identidad que refuerza (hábito basado en identidad)">
        <Input value={form.identidad} onChange={e => set('identidad', e.target.value)} placeholder='ej. "Soy una persona que cuida su mente"' />
        <div style={{ fontSize: 11, color: C.textMut, marginTop: 5 }}>
          Cada vez que cumplas este hábito, votas por esta versión de ti.
        </div>
      </Campo>

      <Campo label="Frecuencia">
        <div style={{ display: 'flex', gap: 8, marginBottom: form.frecuencia === 'semanal' ? 10 : 0 }}>
          {['diaria', 'semanal'].map(f => (
            <button key={f} onClick={() => set('frecuencia', f)} style={{
              ...chip(form.frecuencia === f), flex: 1, padding: 11, fontSize: 14,
              fontWeight: form.frecuencia === f ? 700 : 500,
            }}>
              {f === 'diaria' ? 'Todos los días' : 'Días específicos'}
            </button>
          ))}
        </div>
        {form.frecuencia === 'semanal' && (
          <div style={{ display: 'flex', gap: 4 }}>
            {DIAS_C.map((d, i) => (
              <button key={i} onClick={() => toggleDia(i)} style={{
                ...chip(form.diasSemana.includes(i)), flex: 1, padding: '9px 0', fontSize: 12,
                fontWeight: form.diasSemana.includes(i) ? 700 : 500,
              }}>{d}</button>
            ))}
          </div>
        )}
      </Campo>

      <Campo label="Una de las 4 leyes (enfoque de diseño)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {LEYES.map(l => (
            <button key={l.id} onClick={() => set('ley', l.id)} style={{
              ...chip(form.ley === l.id), padding: '10px 12px', fontSize: 12, textAlign: 'left',
            }}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>
      </Campo>

      <Campo label="Versión de 2 minutos (para los días difíciles)">
        <Input value={form.versionDosMinutos} onChange={e => set('versionDosMinutos', e.target.value)} placeholder="ej. Solo leer 1 página" />
        <div style={{ fontSize: 11, color: C.textMut, marginTop: 5 }}>
          La regla de los 2 minutos: si el hábito parece imposible, ¿cuál es su versión mínima?
        </div>
      </Campo>

      <Campo label="Apilar después de (habit stacking)">
        <Input value={form.despuesDe} onChange={e => set('despuesDe', e.target.value)} placeholder="ej. Después de prepararme el café..." />
        <div style={{ fontSize: 11, color: C.textMut, marginTop: 5 }}>
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
    obvio: '👁️ Obvio', atractivo: '✨ Atractivo', facil: '🎯 Fácil', satisfactorio: '🏆 Satisfactorio',
  };

  return (
    <Card style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, background: completadoHoy ? C.sage : C.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
        }}>
          {habito.emoji || '⭐'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{habito.nombre}</div>
          <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>
            {habito.frecuencia === 'diaria' ? 'Todos los días' : (habito.diasSemana || []).map(d => DIAS_C[d]).join(', ') || 'Sin días'}
            {habito.ley && <span style={{ marginLeft: 8, color: PASTEL_TEXT[C.sage] }}>{LEYES_LABEL[habito.ley]}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {racha > 0 && (
            <div style={{ fontSize: 14, fontWeight: 700, color: C.streak }}>🔥 {racha}</div>
          )}
          {completadoHoy && <div style={{ fontSize: 11, color: PASTEL_TEXT[C.sage], marginTop: 2 }}>✓ hoy</div>}
        </div>
      </div>

      {expandido && (
        <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${C.line}` }}>
          {habito.identidad && (
            <div style={{ fontSize: 13, color: PASTEL_TEXT[C.sage], marginBottom: 6, fontStyle: 'italic' }}>
              🎯 "{habito.identidad}"
            </div>
          )}
          {habito.despuesDe && (
            <div style={{ fontSize: 13, color: C.textMut, marginBottom: 6 }}>
              🔗 Apilar tras: <em>{habito.despuesDe}</em>
            </div>
          )}
          {habito.versionDosMinutos && (
            <div style={{ fontSize: 13, color: C.textMut, marginBottom: 12 }}>
              ⏱ 2 minutos: {habito.versionDosMinutos}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" small onClick={onEditar}>✏️ Editar</Btn>
            <Btn variant="danger" small onClick={onEliminar}>🗑 Eliminar</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

function PanelBuenos({ habitos, setHabitos, registros, triggerNuevo }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    if (triggerNuevo) { setEditando(null); setModal(true); }
  }, [triggerNuevo]);

  const guardar = datos => {
    if (editando) setHabitos(prev => prev.map(h => h.id === editando.id ? { ...h, ...datos } : h));
    else setHabitos(prev => [...prev, { ...datos, id: uid(), creadoEn: HOY }]);
    setModal(false);
    setEditando(null);
  };

  const eliminar = id => {
    if (window.confirm('¿Eliminar este hábito? Esta acción no se puede deshacer.')) {
      setHabitos(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div>
      <div style={{
        background: C.surfaceAlt, borderRadius: 14, padding: '12px 16px', marginBottom: 16,
        fontSize: 13, color: PASTEL_TEXT[C.sage], lineHeight: 1.6,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <span>💡 Hazlos <strong>obvios</strong>, <strong>atractivos</strong>, <strong>fáciles</strong> y <strong>satisfactorios</strong>.</span>
        <Btn small onClick={() => { setEditando(null); setModal(true); }} style={{ flexShrink: 0 }}>+ Nuevo</Btn>
      </div>

      {habitos.length === 0 ? (
        <EmptyState texto="Aún no tienes hábitos. ¡Crea el primero!" emoji="🌱"
          accion={<Btn onClick={() => setModal(true)}>Crear mi primer hábito</Btn>} />
      ) : (
        habitos.map(h => (
          <HabitoCard
            key={h.id}
            habito={h}
            racha={calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)}
            completadoHoy={!!registros[HOY]?.habitos?.[h.id]}
            onEditar={() => { setEditando(h); setModal(true); }}
            onEliminar={() => eliminar(h.id)}
          />
        ))
      )}

      {modal && (
        <ModalHabito habito={editando} onGuardar={guardar} onClose={() => { setModal(false); setEditando(null); }} />
      )}
    </div>
  );
}

export default function VistaHabitos({ habitos, setHabitos, registros, malosHabitos, setMalosHabitos, accionPendiente, limpiarAccion }) {
  const [segmento, setSegmento] = useState('buenos');
  const [trigBuenos, setTrigBuenos] = useState(0);
  const [trigMalos, setTrigMalos] = useState(0);

  // Reaccionar al FAB: cambia de segmento y dispara apertura del modal
  useEffect(() => {
    if (!accionPendiente) return;
    if (accionPendiente.tipo === 'habito') {
      setSegmento('buenos');
      setTrigBuenos(accionPendiente.t);
    } else if (accionPendiente.tipo === 'malo') {
      setSegmento('romper');
      setTrigMalos(accionPendiente.t);
    }
    limpiarAccion?.();
  }, [accionPendiente, limpiarAccion]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: C.text }}>Mis Hábitos</h1>

      <div style={{ marginBottom: 20 }}>
        <Segmented
          opciones={[{ id: 'buenos', label: '✅ Buenos' }, { id: 'romper', label: '🚫 Romper' }]}
          valor={segmento}
          onChange={setSegmento}
        />
      </div>

      {segmento === 'buenos' ? (
        <PanelBuenos habitos={habitos} setHabitos={setHabitos} registros={registros} triggerNuevo={trigBuenos} />
      ) : (
        <VistaMalosHabitos malosHabitos={malosHabitos} setMalosHabitos={setMalosHabitos} triggerNuevo={trigMalos} />
      )}
    </div>
  );
}
