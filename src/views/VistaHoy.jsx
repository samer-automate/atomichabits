import { useState } from 'react';
import { DIAS, getHoy, getDow, calcularRacha, addDias } from '../utils.js';
import { C, SectionHeader, EmptyState, Btn } from '../components/ui.jsx';

const HOY = getHoy();
const HOY_DOW = getDow(HOY);

function HabitoHoyCard({ habito, completado, racha, onToggle }) {
  const [animando, setAnimando] = useState(false);

  const handleClick = () => {
    if (!completado) {
      setAnimando(true);
      setTimeout(() => setAnimando(false), 700);
    }
    onToggle();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: completado ? 'rgba(74,222,128,0.07)' : '#131313',
        border: `1px solid ${completado ? 'rgba(74,222,128,0.25)' : '#1e1e1e'}`,
        borderRadius: 14, padding: '14px 16px', marginBottom: 10,
        cursor: 'pointer',
        transform: animando ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: animando ? `0 0 24px rgba(74,222,128,0.2)` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Círculo de check */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: completado ? C.green : 'transparent',
          border: `2px solid ${completado ? C.green : '#3a3a3a'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#000',
          transition: 'all 0.3s ease',
          boxShadow: animando ? `0 0 16px ${C.green}` : 'none',
        }}>
          {completado ? '✓' : <span style={{ fontSize: 20 }}>{habito.emoji || '○'}</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: completado ? '#555' : 'var(--text)',
            textDecoration: completado ? 'line-through' : 'none',
          }}>
            {habito.nombre}
          </div>
          {habito.identidad && (
            <div style={{ fontSize: 12, color: '#4a7a5a', marginTop: 2, fontStyle: 'italic' }}>
              → {habito.identidad}
            </div>
          )}
          {!completado && habito.versionDosMinutos && (
            <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>
              ⏱ 2 min: {habito.versionDosMinutos}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {racha > 0 && (
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: racha >= 21 ? C.orange : racha >= 7 ? C.yellow : '#888',
            }}>
              🔥 {racha}
            </div>
          )}
        </div>
      </div>

      {completado && (
        <div style={{
          marginTop: 10, fontSize: 12, color: '#4ade80',
          padding: '6px 10px', background: 'rgba(74,222,128,0.06)', borderRadius: 8,
        }}>
          ✨ ¡Un voto más para la persona que quieres ser!
        </div>
      )}
    </div>
  );
}

function EntrenamientoHoyCard({ entrenamiento, onRegistrar }) {
  return (
    <div style={{
      background: '#131313', border: '1px solid #1e1910', borderRadius: 14,
      padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {entrenamiento.emoji || '💪'} {entrenamiento.nombre}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
            {entrenamiento.ejercicios?.length || 0} ejercicio{entrenamiento.ejercicios?.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Btn variant="orange" small onClick={onRegistrar}>Registrar</Btn>
      </div>
    </div>
  );
}

function MaloHabitoHoyCard({ mh }) {
  const diasSin = Math.max(0, Math.round((new Date(HOY) - new Date(mh.inicioConteo || HOY)) / 86_400_000));
  const color = diasSin > 30 ? C.green : diasSin > 7 ? C.yellow : diasSin > 0 ? C.orange : C.red;

  return (
    <div style={{
      background: '#131313', border: '1px solid #1e1414', borderRadius: 14,
      padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, background: '#0f0f0f',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}30`,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{diasSin}</span>
          <span style={{ fontSize: 9, color: '#555' }}>días</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>🚫 {mh.nombre}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            Mejor racha: {mh.mejorRacha || 0} días
          </div>
          {mh.sustitucion && (
            <div style={{ fontSize: 11, color: '#4a7a5a', marginTop: 3 }}>
              💡 {mh.sustitucion}
            </div>
          )}
        </div>
      </div>
      {diasSin === 0 && (
        <div style={{
          marginTop: 10, padding: '8px 12px', background: 'rgba(248,113,113,0.06)',
          borderRadius: 8, fontSize: 12, color: '#f87171',
        }}>
          No falles dos veces seguidas. Mañana es tu oportunidad de recuperarte 💪
        </div>
      )}
    </div>
  );
}

export default function VistaHoy({ habitos, malosHabitos, entrenamientos, rutinas, registros, setRegistros, onRegistrarSesion }) {
  const habitosHoy = habitos.filter(h =>
    h.frecuencia === 'diaria' || (h.diasSemana || []).includes(HOY_DOW)
  );

  const entrenamientosHoy = (rutinas[HOY_DOW]?.workouts || [])
    .map(wid => entrenamientos.find(e => e.id === wid))
    .filter(Boolean);

  const regHoy = registros[HOY] || {};
  const completadosHoy = habitosHoy.filter(h => regHoy.habitos?.[h.id]).length;
  const pct = habitosHoy.length ? Math.round((completadosHoy / habitosHoy.length) * 100) : 0;

  const toggleHabito = (hid) => {
    setRegistros(prev => ({
      ...prev,
      [HOY]: {
        ...prev[HOY],
        habitos: { ...(prev[HOY]?.habitos || {}), [hid]: !prev[HOY]?.habitos?.[hid] },
      },
    }));
  };

  const mensaje = () => {
    if (pct === 100 && habitosHoy.length > 0) return '¡Día perfecto! 🏆 Eres quien quieres ser.';
    if (pct >= 75) return '¡Casi lo tienes! Solo un poco más 💪';
    if (pct >= 50) return 'Vas por buen camino. Cada hábito cuenta 🎯';
    if (completadosHoy > 0) return `${completadosHoy} voto${completadosHoy > 1 ? 's' : ''} para la persona que quieres ser ✨`;
    return habitosHoy.length > 0 ? `${habitosHoy.length} hábito${habitosHoy.length !== 1 ? 's' : ''} te esperan hoy` : '¡Buen día! 🌅';
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header motivacional */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1f0d 0%, #0d0d1f 100%)',
        borderRadius: 16, padding: '20px', marginBottom: 24,
        border: '1px solid #1e2e1e',
      }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
          {DIAS[HOY_DOW].charAt(0).toUpperCase() + DIAS[HOY_DOW].slice(1)}, {HOY.split('-').reverse().join('/')}
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: habitosHoy.length ? 14 : 0 }}>
          {mensaje()}
        </div>
        {habitosHoy.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 6 }}>
              <span>{completadosHoy} de {habitosHoy.length} completados</span>
              <span style={{ color: pct === 100 ? C.green : '#aaa' }}>{pct}%</span>
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: 6, height: 7, overflow: 'hidden' }}>
              <div style={{
                background: `linear-gradient(90deg, ${C.green}, ${C.greenDark})`,
                width: `${pct}%`, height: '100%', borderRadius: 6,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </>
        )}
      </div>

      {/* Hábitos del día */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader titulo="Hábitos de hoy" count={habitosHoy.length} />
        {habitosHoy.length === 0 ? (
          <EmptyState texto="No hay hábitos programados para hoy" emoji="😌" />
        ) : (
          habitosHoy.map(h => (
            <HabitoHoyCard
              key={h.id}
              habito={h}
              completado={!!regHoy.habitos?.[h.id]}
              racha={calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)}
              onToggle={() => toggleHabito(h.id)}
            />
          ))
        )}
      </section>

      {/* Entrenamiento */}
      {entrenamientosHoy.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader titulo="Entrenamiento de hoy" count={entrenamientosHoy.length} color={C.orange} />
          {entrenamientosHoy.map(e => (
            <EntrenamientoHoyCard key={e.id} entrenamiento={e} onRegistrar={() => onRegistrarSesion(e)} />
          ))}
        </section>
      )}

      {/* Vigilancia malos hábitos */}
      {malosHabitos.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader titulo="Vigilancia · hábitos a romper" count={malosHabitos.length} color={C.red} />
          {malosHabitos.map(mh => (
            <MaloHabitoHoyCard key={mh.id} mh={mh} />
          ))}
        </section>
      )}

      {/* Principio del día */}
      <div style={{
        borderRadius: 12, padding: '14px 16px',
        background: '#0a0a0a', border: '1px solid #1a1a1a',
        fontSize: 13, color: '#555', fontStyle: 'italic', lineHeight: 1.6,
      }}>
        "El éxito no es un evento, es un sistema. No subes al nivel de tus objetivos, caes al nivel de tus sistemas."
        <div style={{ marginTop: 6, fontSize: 11, color: '#3a3a3a', fontStyle: 'normal' }}>— James Clear, Hábitos Atómicos</div>
      </div>
    </div>
  );
}
