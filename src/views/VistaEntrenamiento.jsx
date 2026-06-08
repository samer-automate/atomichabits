import { useState } from 'react';
import { DIAS, DIAS_C, getHoy, getDow, uid } from '../utils.js';
import { C, Btn, Campo, Input, Textarea, Modal, SectionHeader, EmptyState } from '../components/ui.jsx';

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
              width: 40, height: 40, borderRadius: 8, border: 'none', background: form.emoji === e ? '#2a1e0f' : '#111',
              fontSize: 20, cursor: 'pointer',
              outline: form.emoji === e ? `2px solid ${C.orange}` : 'none',
            }}>{e}</button>
          ))}
        </div>
      </Campo>

      <Campo label="Nombre del plan" required>
        <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="ej. Pierna, Pecho/Tríceps, Cardio" />
      </Campo>

      <Campo label="Ejercicios">
        {form.ejercicios.map((ej, i) => (
          <div key={ej.id || i} style={{ background: '#0f0f0f', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input
                value={ej.nombre}
                onChange={e => updEj(i, 'nombre', e.target.value)}
                placeholder="Nombre del ejercicio"
                style={{ flex: 2 }}
              />
              <button onClick={() => remEj(i)} style={{
                background: 'none', border: `1px solid #2a1a1a`, color: C.red,
                borderRadius: 6, padding: '0 12px', cursor: 'pointer', fontSize: 16, flexShrink: 0,
              }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['series', 'Series'], ['reps', 'Reps'], ['peso', 'Peso (kg)']].map(([k, lbl]) => (
                <div key={k} style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 3 }}>{lbl}</label>
                  <Input
                    type="number"
                    value={ej[k]}
                    onChange={e => updEj(i, k, e.target.value)}
                    placeholder={k === 'peso' ? '—' : undefined}
                    style={{ padding: '7px 10px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Btn variant="ghost" small onClick={addEj} style={{ marginTop: 4 }}>+ Añadir ejercicio</Btn>
      </Campo>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="orange" disabled={!form.nombre.trim()} onClick={() => onGuardar(form)}>
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
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Marca los ejercicios completados. Ajusta los valores reales si difieren del plan.
      </p>

      {ejercicios.map((ej, i) => (
        <div key={ej.id || i} style={{
          background: ej.completado ? 'rgba(251,146,60,0.06)' : '#0f0f0f',
          border: `1px solid ${ej.completado ? 'rgba(251,146,60,0.25)' : '#1a1a1a'}`,
          borderRadius: 10, padding: '10px 12px', marginBottom: 8,
          transition: 'all 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox" checked={ej.completado} onChange={() => toggleEj(i)}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.orange }}
            />
            <span style={{ fontWeight: 600, flex: 1, fontSize: 14 }}>{ej.nombre}</span>
            <span style={{ fontSize: 12, color: '#555' }}>
              {ej.seriesReal}×{ej.repsReal}{ej.pesoReal ? ` · ${ej.pesoReal}kg` : ''}
            </span>
          </div>
          {ej.completado && (
            <div style={{ display: 'flex', gap: 6, paddingLeft: 28, marginTop: 8 }}>
              {[['seriesReal', 'Series'], ['repsReal', 'Reps'], ['pesoReal', 'Peso']].map(([k, lbl]) => (
                <div key={k} style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 2 }}>{lbl}</label>
                  <Input type="number" value={ej[k]} onChange={e => updEj(i, k, e.target.value)} style={{ padding: '6px 8px', fontSize: 13 }} />
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
          <Input type="date" value={HOY} disabled style={{ color: '#666' }} />
        </Campo>
      </div>

      <Campo label="Notas de la sesión">
        <Textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="¿Cómo te has sentido? ¿Nuevo récord? ¿Algo a mejorar?" />
      </Campo>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="orange" onClick={() => onGuardar({
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
    <div style={{ background: '#131313', border: '1px solid #1e1a11', borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10, background: '#0f0c08',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, border: '1px solid #2a1a0a', flexShrink: 0,
          }}>
            {plan.emoji || '💪'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{plan.nombre}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
              {plan.ejercicios?.length || 0} ejercicio{plan.ejercicios?.length !== 1 ? 's' : ''}
            </div>
          </div>
          <Btn variant="orange" small onClick={e => { e.stopPropagation(); onRegistrar(); }}>
            Registrar
          </Btn>
        </div>
      </div>

      {expandido && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #1a1a1a' }}>
          {(plan.ejercicios || []).map((ej, i) => (
            <div key={ej.id || i} style={{
              display: 'flex', justifyContent: 'space-between', padding: '7px 0',
              borderBottom: '1px solid #141414', fontSize: 13,
            }}>
              <span>{ej.nombre}</span>
              <span style={{ color: '#666' }}>
                {ej.series}×{ej.reps}{ej.peso ? ` · ${ej.peso}kg` : ''}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn variant="ghost" small onClick={onEditar}>✏️ Editar</Btn>
            <Btn variant="danger" small onClick={onEliminar}>🗑 Eliminar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function SesionCard({ sesion }) {
  const [expandido, setExpandido] = useState(false);
  return (
    <div style={{ background: '#131313', border: '1px solid #1e1a11', borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
      <div onClick={() => setExpandido(!expandido)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 28 }}>{sesion.planEmoji || '💪'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{sesion.planNombre}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
            {sesion.fecha?.split('-').reverse().join('/')}
            {sesion.duracion && ` · ${sesion.duracion} min`}
            {sesion.ejerciciosRealizados?.length > 0 && ` · ${sesion.ejerciciosRealizados.length} ejercicios`}
          </div>
        </div>
        <span style={{ fontSize: 20 }}>✅</span>
      </div>
      {expandido && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #1a1a1a' }}>
          {(sesion.ejerciciosRealizados || []).map((ej, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #141414', fontSize: 13 }}>
              <span>{ej.nombre}</span>
              <span style={{ color: C.orange }}>{ej.series}×{ej.reps}{ej.peso ? ` · ${ej.peso}kg` : ''}</span>
            </div>
          ))}
          {sesion.notas && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#666' }}>📝 {sesion.notas}</div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-vista de Rutinas dentro de Entrena ---
function RutinasSection({ habitos, entrenamientos, rutinas, setRutinas }) {
  const [diaAbierto, setDiaAbierto] = useState(HOY_DOW);

  return (
    <div>
      <SectionHeader titulo="Rutinas semanales" color={C.purple} />
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
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
          <div key={dow} style={{
            background: dow === HOY_DOW ? '#0f1a0f' : '#131313',
            border: `1px solid ${dow === HOY_DOW ? '#1e3a1e' : '#1e1e1e'}`,
            borderRadius: 12, marginBottom: 8, overflow: 'hidden',
          }}>
            <div onClick={() => setDiaAbierto(abierto ? -1 : dow)} style={{
              padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>
                {dow === HOY_DOW && '📍 '}
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
                {dow === HOY_DOW && <span style={{ fontSize: 11, color: C.green, marginLeft: 8 }}>HOY</span>}
              </span>
              <span style={{ fontSize: 12, color: '#555' }}>
                {total === 0 ? 'Sin asignar' : `${rutina.habits?.length || 0}h · ${rutina.workouts?.length || 0}e`}
              </span>
              <span style={{ color: '#444', fontSize: 12 }}>{abierto ? '▲' : '▼'}</span>
            </div>

            {abierto && (
              <div style={{ padding: '0 16px 14px', borderTop: '1px solid #1a1a1a' }}>
                {habitos.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hábitos</div>
                    {habitos.map(h => (
                      <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #141414' }}>
                        <input type="checkbox" checked={(rutina.habits || []).includes(h.id)} onChange={() => toggleHabito(h.id)}
                          style={{ width: 16, height: 16, accentColor: C.green }} />
                        <span style={{ fontSize: 14 }}>{h.emoji} {h.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
                {entrenamientos.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entrenamientos</div>
                    {entrenamientos.map(e => (
                      <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #141414' }}>
                        <input type="checkbox" checked={(rutina.workouts || []).includes(e.id)} onChange={() => toggleWorkout(e.id)}
                          style={{ width: 16, height: 16, accentColor: C.orange }} />
                        <span style={{ fontSize: 14 }}>{e.emoji} {e.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
                {habitos.length === 0 && entrenamientos.length === 0 && (
                  <p style={{ fontSize: 13, color: '#444' }}>Crea hábitos y planes primero.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function VistaEntrenamiento({ entrenamientos, setEntrenamientos, sesiones, setSesiones, habitos, rutinas, setRutinas }) {
  const [tab, setTab] = useState('planes');
  const [modalPlan, setModalPlan] = useState(false);
  const [editandoPlan, setEditandoPlan] = useState(null);
  const [modalSesion, setModalSesion] = useState(null);

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

  const TABS = [
    { id: 'planes', label: '💪 Planes' },
    { id: 'historial', label: '📅 Historial' },
    { id: 'rutinas', label: '📆 Rutinas' },
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Entrenamiento</h1>
        {tab === 'planes' && (
          <Btn variant="orange" onClick={() => { setEditandoPlan(null); setModalPlan(true); }}>+ Plan</Btn>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
            background: tab === id ? '#2a1e0a' : '#111',
            color: tab === id ? C.orange : '#777',
            fontWeight: tab === id ? 700 : 400,
            outline: tab === id ? `1px solid ${C.orange}` : 'none',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'planes' && (
        entrenamientos.length === 0
          ? <EmptyState texto="Crea tu primer plan de entrenamiento" emoji="💪" accion={<Btn variant="orange" onClick={() => setModalPlan(true)}>Crear plan</Btn>} />
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
    </div>
  );
}

export { ModalSesion };
