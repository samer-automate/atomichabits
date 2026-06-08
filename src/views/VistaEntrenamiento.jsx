import { useState, useEffect } from 'react';
import { DIAS, getHoy, getDow, uid } from '../utils.js';
import { C, Btn, Campo, Input, Textarea, Modal, SectionHeader, EmptyState, Card, Segmented, PASTEL_TEXT } from '../components/ui.jsx';

const HOY = getHoy();
const HOY_DOW = getDow(HOY);

const EMOJIS_GYM = ['💪', '🏋️', '🏃', '🚴', '🤸', '🥊', '⚽', '🏊', '🧘', '🏇', '🏒', '🎾', '🤾', '🥋', '⛹️'];

// --- Modal para crear/editar plan ---
function ModalPlan({ plan, onGuardar, onClose }) {
  const [form, setForm] = useState({
    nombre: plan?.nombre || '',
    emoji: plan?.emoji || '💪',
    ejercicios: plan?.ejercicios?.map(e => ({ ...e })) || [],
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addEj = () => set('ejercicios', [...form.ejercicios, { id: uid(), nombre: '', series: 3, reps: 10, peso: '', unidad: 'kg' }]);
  const updEj = (i, k, v) => {
    const ejs = [...form.ejercicios];
    ejs[i] = { ...ejs[i], [k]: v };
    set('ejercicios', ejs);
  };
  const remEj = i => set('ejercicios', form.ejercicios.filter((_, idx) => idx !== i));

  return (
    <Modal titulo={plan ? 'Editar plan' : 'Nuevo plan de entrenamiento'} onClose={onClose} size="lg">
      <Campo label="Elige un emoji">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {EMOJIS_GYM.map(e => (
            <button key={e} onClick={() => set('emoji', e)} style={{
              width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: form.emoji === e ? C.yellow : C.surfaceAlt, fontSize: 20,
            }}>{e}</button>
          ))}
        </div>
      </Campo>

      <Campo label="Nombre del plan" required>
        <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej. Pierna, Pecho/Tríceps, Cardio" />
      </Campo>

      <Campo label="Ejercicios">
        {form.ejercicios.map((ej, i) => (
          <div key={ej.id || i} style={{ background: C.surfaceAlt, borderRadius: 14, padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input value={ej.nombre} onChange={e => updEj(i, 'nombre', e.target.value)} placeholder="Nombre del ejercicio" style={{ flex: 2 }} />
              <button onClick={() => remEj(i)} style={{
                background: C.pink, border: 'none', color: PASTEL_TEXT[C.pink],
                borderRadius: 10, padding: '0 14px', cursor: 'pointer', fontSize: 16, flexShrink: 0,
              }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['series', 'Series'], ['reps', 'Reps'], ['peso', 'Peso (kg)']].map(([k, lbl]) => (
                <div key={k} style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: C.textMut, display: 'block', marginBottom: 3 }}>{lbl}</label>
                  <Input type="number" value={ej[k]} onChange={e => updEj(i, k, e.target.value)} placeholder={k === 'peso' ? '—' : undefined} style={{ padding: '8px 10px' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Btn variant="ghost" small onClick={addEj} style={{ marginTop: 4 }}>+ Añadir ejercicio</Btn>
      </Campo>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="yellow" disabled={!form.nombre.trim()} onClick={() => onGuardar(form)}>
          {plan ? 'Guardar cambios' : 'Crear plan'}
        </Btn>
      </div>
    </Modal>
  );
}

// --- Modal para registrar una sesión ---
function ModalSesion({ plan, onGuardar, onClose }) {
  const [duracion, setDuracion] = useState('');
  const [notas, setNotas] = useState('');
  const [ejercicios, setEjercicios] = useState(
    (plan.ejercicios || []).map(e => ({ ...e, seriesReal: e.series, repsReal: e.reps, pesoReal: e.peso, completado: false }))
  );

  const toggleEj = i => {
    const ejs = [...ejercicios];
    ejs[i] = { ...ejs[i], completado: !ejs[i].completado };
    setEjercicios(ejs);
  };
  const updEj = (i, k, v) => {
    const ejs = [...ejercicios];
    ejs[i] = { ...ejs[i], [k]: v };
    setEjercicios(ejs);
  };

  return (
    <Modal titulo={`Registrar sesión · ${plan.nombre}`} onClose={onClose} size="lg">
      <p style={{ fontSize: 13, color: C.textMut, marginBottom: 16 }}>
        Marca los ejercicios completados. Ajusta los valores reales si difieren del plan.
      </p>

      {ejercicios.map((ej, i) => (
        <div key={ej.id || i} style={{
          background: ej.completado ? C.yellow : C.surfaceAlt,
          borderRadius: 14, padding: '10px 12px', marginBottom: 8, transition: 'all 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={ej.completado} onChange={() => toggleEj(i)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.ink }} />
            <span style={{ fontWeight: 600, flex: 1, fontSize: 14, color: C.text }}>{ej.nombre}</span>
            <span style={{ fontSize: 12, color: C.textMut }}>
              {ej.seriesReal}×{ej.repsReal}{ej.pesoReal ? ` · ${ej.pesoReal}kg` : ''}
            </span>
          </div>
          {ej.completado && (
            <div style={{ display: 'flex', gap: 6, paddingLeft: 28, marginTop: 8 }}>
              {[['seriesReal', 'Series'], ['repsReal', 'Reps'], ['pesoReal', 'Peso']].map(([k, lbl]) => (
                <div key={k} style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: C.textMut, display: 'block', marginBottom: 2 }}>{lbl}</label>
                  <Input type="number" value={ej[k]} onChange={e => updEj(i, k, e.target.value)} style={{ padding: '6px 8px', fontSize: 13, background: C.surface }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <Campo label="Duración (minutos)">
          <Input type="number" value={duracion} onChange={e => setDuracion(e.target.value)} placeholder="ej. 45" />
        </Campo>
        <Campo label="Fecha">
          <Input type="date" value={HOY} disabled style={{ color: C.textMut }} />
        </Campo>
      </div>

      <Campo label="Notas de la sesión">
        <Textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="¿Cómo te has sentido? ¿Nuevo récord? ¿Algo a mejorar?" />
      </Campo>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="yellow" onClick={() => onGuardar({
          planId: plan.id, planNombre: plan.nombre, planEmoji: plan.emoji,
          duracion: duracion ? +duracion : null, notas,
          ejerciciosRealizados: ejercicios.filter(e => e.completado).map(e => ({
            nombre: e.nombre, series: e.seriesReal, reps: e.repsReal, peso: e.pesoReal,
          })),
        })}>
          ✅ Guardar sesión
        </Btn>
      </div>
    </Modal>
  );
}

function PlanCard({ plan, onEditar, onEliminar, onRegistrar }) {
  const [expandido, setExpandido] = useState(false);
  return (
    <Card style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, background: C.yellow,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
          }}>
            {plan.emoji || '💪'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{plan.nombre}</div>
            <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>
              {plan.ejercicios?.length || 0} ejercicio{plan.ejercicios?.length !== 1 ? 's' : ''}
            </div>
          </div>
          <Btn variant="yellow" small onClick={e => { e.stopPropagation(); onRegistrar(); }}>Registrar</Btn>
        </div>
      </div>

      {expandido && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${C.line}` }}>
          {(plan.ejercicios || []).map((ej, i) => (
            <div key={ej.id || i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: `1px solid ${C.line}`, fontSize: 13, color: C.text,
            }}>
              <span>{ej.nombre}</span>
              <span style={{ color: C.textMut }}>{ej.series}×{ej.reps}{ej.peso ? ` · ${ej.peso}kg` : ''}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn variant="ghost" small onClick={onEditar}>✏️ Editar</Btn>
            <Btn variant="danger" small onClick={onEliminar}>🗑 Eliminar</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

function SesionCard({ sesion }) {
  const [expandido, setExpandido] = useState(false);
  return (
    <Card style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: C.sage,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
        }}>{sesion.planEmoji || '💪'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{sesion.planNombre}</div>
          <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>
            {sesion.fecha?.split('-').reverse().join('/')}
            {sesion.duracion && ` · ${sesion.duracion} min`}
            {sesion.ejerciciosRealizados?.length > 0 && ` · ${sesion.ejerciciosRealizados.length} ejercicios`}
          </div>
        </div>
        <span style={{ fontSize: 20 }}>✅</span>
      </div>
      {expandido && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${C.line}` }}>
          {(sesion.ejerciciosRealizados || []).map((ej, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.line}`, fontSize: 13, color: C.text }}>
              <span>{ej.nombre}</span>
              <span style={{ color: PASTEL_TEXT[C.yellow] }}>{ej.series}×{ej.reps}{ej.peso ? ` · ${ej.peso}kg` : ''}</span>
            </div>
          ))}
          {sesion.notas && (
            <div style={{ marginTop: 10, fontSize: 13, color: C.textMut }}>📝 {sesion.notas}</div>
          )}
        </div>
      )}
    </Card>
  );
}

// Selector de plan para registrar (cuando hay varios)
function PickerPlan({ planes, onElegir, onClose }) {
  return (
    <Modal titulo="¿Qué entrenamiento registras?" onClose={onClose}>
      {planes.map(p => (
        <button key={p.id} onClick={() => onElegir(p)} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          background: C.surfaceAlt, border: 'none', borderRadius: 14,
          padding: '12px 14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left',
        }}>
          <span style={{ fontSize: 24 }}>{p.emoji || '💪'}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 600, color: C.text }}>{p.nombre}</span>
            <span style={{ fontSize: 12, color: C.textMut }}>{p.ejercicios?.length || 0} ejercicios</span>
          </span>
        </button>
      ))}
    </Modal>
  );
}

// --- Sub-vista de Rutinas ---
function RutinasSection({ habitos, entrenamientos, rutinas, setRutinas }) {
  const [diaAbierto, setDiaAbierto] = useState(HOY_DOW);

  return (
    <div>
      <SectionHeader titulo="Rutinas semanales" color={PASTEL_TEXT[C.lavender]} />
      <p style={{ fontSize: 13, color: C.textMut, marginBottom: 16 }}>
        Asigna hábitos y entrenamientos a días concretos de la semana.
      </p>

      {DIAS.map((dia, dow) => {
        const abierto = diaAbierto === dow;
        const rutina = rutinas[dow] || { habits: [], workouts: [] };
        const total = (rutina.habits?.length || 0) + (rutina.workouts?.length || 0);

        const toggleHabito = hid => setRutinas(prev => {
          const r = prev[dow] || { habits: [], workouts: [] };
          return { ...prev, [dow]: { ...r, habits: r.habits?.includes(hid) ? r.habits.filter(h => h !== hid) : [...(r.habits || []), hid] } };
        });
        const toggleWorkout = wid => setRutinas(prev => {
          const r = prev[dow] || { habits: [], workouts: [] };
          return { ...prev, [dow]: { ...r, workouts: r.workouts?.includes(wid) ? r.workouts.filter(w => w !== wid) : [...(r.workouts || []), wid] } };
        });

        return (
          <Card key={dow} style={{
            marginBottom: 8, padding: 0, overflow: 'hidden',
            background: dow === HOY_DOW ? C.sage : C.surface,
          }}>
            <div onClick={() => setDiaAbierto(abierto ? -1 : dow)} style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontWeight: 700, fontSize: 14, flex: 1, color: C.text }}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
                {dow === HOY_DOW && <span style={{ fontSize: 11, color: PASTEL_TEXT[C.sage], marginLeft: 8 }}>HOY</span>}
              </span>
              <span style={{ fontSize: 12, color: C.textMut }}>
                {total === 0 ? 'Sin asignar' : `${rutina.habits?.length || 0}h · ${rutina.workouts?.length || 0}e`}
              </span>
              <span style={{ color: C.textFaint, fontSize: 12 }}>{abierto ? '▲' : '▼'}</span>
            </div>

            {abierto && (
              <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${C.line}`, background: C.surface }}>
                {habitos.length > 0 && (
                  <div style={{ marginBottom: 12, paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: C.textMut, marginBottom: 8, fontWeight: 600 }}>Hábitos</div>
                    {habitos.map(h => (
                      <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: `1px solid ${C.line}` }}>
                        <input type="checkbox" checked={(rutina.habits || []).includes(h.id)} onChange={() => toggleHabito(h.id)} style={{ width: 16, height: 16, accentColor: C.ink }} />
                        <span style={{ fontSize: 14, color: C.text }}>{h.emoji} {h.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
                {entrenamientos.length > 0 && (
                  <div style={{ paddingTop: habitos.length ? 0 : 12 }}>
                    <div style={{ fontSize: 11, color: C.textMut, marginBottom: 8, fontWeight: 600 }}>Entrenamientos</div>
                    {entrenamientos.map(e => (
                      <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: `1px solid ${C.line}` }}>
                        <input type="checkbox" checked={(rutina.workouts || []).includes(e.id)} onChange={() => toggleWorkout(e.id)} style={{ width: 16, height: 16, accentColor: C.ink }} />
                        <span style={{ fontSize: 14, color: C.text }}>{e.emoji} {e.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
                {habitos.length === 0 && entrenamientos.length === 0 && (
                  <p style={{ fontSize: 13, color: C.textFaint, paddingTop: 12 }}>Crea hábitos y planes primero.</p>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default function VistaEntrenamiento({ entrenamientos, setEntrenamientos, sesiones, setSesiones, habitos, rutinas, setRutinas, accionPendiente, limpiarAccion }) {
  const [tab, setTab] = useState('planes');
  const [modalPlan, setModalPlan] = useState(false);
  const [editandoPlan, setEditandoPlan] = useState(null);
  const [modalSesion, setModalSesion] = useState(null);
  const [picker, setPicker] = useState(false);

  // FAB "Registrar entrenamiento"
  useEffect(() => {
    if (accionPendiente?.tipo === 'entreno') {
      setTab('planes');
      if (entrenamientos.length === 1) setModalSesion(entrenamientos[0]);
      else if (entrenamientos.length > 1) setPicker(true);
      else { setEditandoPlan(null); setModalPlan(true); } // sin planes → crear uno
      limpiarAccion?.();
    }
  }, [accionPendiente, entrenamientos, limpiarAccion]);

  const guardarPlan = datos => {
    if (editandoPlan) setEntrenamientos(prev => prev.map(e => e.id === editandoPlan.id ? { ...e, ...datos } : e));
    else setEntrenamientos(prev => [...prev, { ...datos, id: uid() }]);
    setModalPlan(false);
    setEditandoPlan(null);
  };

  const eliminarPlan = id => {
    if (window.confirm('¿Eliminar este plan?')) setEntrenamientos(prev => prev.filter(e => e.id !== id));
  };

  const guardarSesion = datos => {
    setSesiones(prev => [...prev, { ...datos, id: uid(), fecha: HOY }]);
    setModalSesion(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text }}>Entrenamiento</h1>
        {tab === 'planes' && (
          <Btn variant="yellow" small onClick={() => { setEditandoPlan(null); setModalPlan(true); }}>+ Plan</Btn>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <Segmented
          opciones={[{ id: 'planes', label: '💪 Planes' }, { id: 'historial', label: '📅 Historial' }, { id: 'rutinas', label: '📆 Rutinas' }]}
          valor={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'planes' && (
        entrenamientos.length === 0
          ? <EmptyState texto="Crea tu primer plan de entrenamiento" emoji="💪" accion={<Btn variant="yellow" onClick={() => setModalPlan(true)}>Crear plan</Btn>} />
          : entrenamientos.map(e => (
            <PlanCard key={e.id} plan={e}
              onEditar={() => { setEditandoPlan(e); setModalPlan(true); }}
              onEliminar={() => eliminarPlan(e.id)}
              onRegistrar={() => setModalSesion(e)}
            />
          ))
      )}

      {tab === 'historial' && (
        sesiones.length === 0
          ? <EmptyState texto="Aún no has registrado ninguna sesión" emoji="📅" />
          : [...sesiones].reverse().map(s => <SesionCard key={s.id} sesion={s} />)
      )}

      {tab === 'rutinas' && (
        <RutinasSection habitos={habitos} entrenamientos={entrenamientos} rutinas={rutinas} setRutinas={setRutinas} />
      )}

      {modalPlan && (
        <ModalPlan plan={editandoPlan} onGuardar={guardarPlan} onClose={() => { setModalPlan(false); setEditandoPlan(null); }} />
      )}
      {modalSesion && (
        <ModalSesion plan={modalSesion} onGuardar={guardarSesion} onClose={() => setModalSesion(null)} />
      )}
      {picker && (
        <PickerPlan planes={entrenamientos} onElegir={p => { setPicker(false); setModalSesion(p); }} onClose={() => setPicker(false)} />
      )}
    </div>
  );
}

export { ModalSesion };
