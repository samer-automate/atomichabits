import { useState } from 'react';
import { DIAS, getHoy, getDow, calcularRacha, addDias } from '../utils.js';
import { C, SectionHeader, EmptyState, Btn, Card, Avatar, DaySelector, PASTEL_TEXT } from '../components/ui.jsx';

const HOY = getHoy();

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
        background: completado ? '#F2F6EC' : C.surface,
        borderRadius: 18, padding: '14px 16px', marginBottom: 10,
        cursor: 'pointer',
        boxShadow: C.shadow,
        transform: animando ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Círculo de check */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: completado ? C.ink : C.surfaceAlt,
          border: `2px solid ${completado ? C.ink : C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#fff',
          transition: 'all 0.3s ease',
          boxShadow: animando ? `0 0 0 6px ${C.sage}` : 'none',
        }}>
          {completado ? '✓' : <span style={{ fontSize: 20 }}>{habito.emoji || '○'}</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: completado ? C.textFaint : C.text,
            textDecoration: completado ? 'line-through' : 'none',
          }}>
            {habito.nombre}
          </div>
          {habito.identidad && (
            <div style={{ fontSize: 12, color: PASTEL_TEXT[C.sage], marginTop: 2, fontStyle: 'italic' }}>
              → {habito.identidad}
            </div>
          )}
          {!completado && habito.versionDosMinutos && (
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 3 }}>
              ⏱ 2 min: {habito.versionDosMinutos}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {racha > 0 && (
            <div style={{ fontSize: 13, fontWeight: 700, color: C.streak }}>
              🔥 {racha}
            </div>
          )}
        </div>
      </div>

      {completado && (
        <div style={{
          marginTop: 10, fontSize: 12, color: PASTEL_TEXT[C.sage],
          padding: '6px 10px', background: C.sage, borderRadius: 10,
        }}>
          ✨ ¡Un voto más para la persona que quieres ser!
        </div>
      )}
    </div>
  );
}

function EntrenamientoHoyCard({ entrenamiento, onRegistrar }) {
  return (
    <Card style={{ marginBottom: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 42, height: 42, borderRadius: 12, background: C.yellow,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
          }}>{entrenamiento.emoji || '💪'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{entrenamiento.nombre}</div>
            <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>
              {entrenamiento.ejercicios?.length || 0} ejercicio{entrenamiento.ejercicios?.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <Btn variant="yellow" small onClick={onRegistrar}>Registrar</Btn>
      </div>
    </Card>
  );
}

function MaloHabitoHoyCard({ mh, fechaRef }) {
  const diasSin = Math.max(0, Math.round((new Date(fechaRef) - new Date(mh.inicioConteo || fechaRef)) / 86_400_000));

  return (
    <Card style={{ marginBottom: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: C.pink,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: PASTEL_TEXT[C.pink], lineHeight: 1 }}>{diasSin}</span>
          <span style={{ fontSize: 9, color: PASTEL_TEXT[C.pink], opacity: 0.7 }}>días</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>🚫 {mh.nombre}</div>
          <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>
            Mejor racha: {mh.mejorRacha || 0} días
          </div>
          {mh.sustitucion && (
            <div style={{ fontSize: 11, color: PASTEL_TEXT[C.sage], marginTop: 3 }}>
              💡 {mh.sustitucion}
            </div>
          )}
        </div>
      </div>
      {diasSin === 0 && (
        <div style={{
          marginTop: 10, padding: '8px 12px', background: C.surfaceAlt,
          borderRadius: 10, fontSize: 12, color: C.danger,
        }}>
          No falles dos veces seguidas. Mañana es tu oportunidad de recuperarte 💪
        </div>
      )}
    </Card>
  );
}

export default function VistaHoy({ perfil, onEditarNombre, habitos, malosHabitos, entrenamientos, rutinas, registros, setRegistros, onRegistrarSesion }) {
  const [fechaSel, setFechaSel] = useState(HOY);
  const dow = getDow(fechaSel);
  const esHoy = fechaSel === HOY;

  const habitosDia = habitos.filter(h =>
    h.frecuencia === 'diaria' || (h.diasSemana || []).includes(dow)
  );

  const entrenamientosDia = (rutinas[dow]?.workouts || [])
    .map(wid => entrenamientos.find(e => e.id === wid))
    .filter(Boolean);

  const regDia = registros[fechaSel] || {};
  const completadosDia = habitosDia.filter(h => regDia.habitos?.[h.id]).length;
  const pct = habitosDia.length ? Math.round((completadosDia / habitosDia.length) * 100) : 0;

  const toggleHabito = (hid) => {
    setRegistros(prev => ({
      ...prev,
      [fechaSel]: {
        ...prev[fechaSel],
        habitos: { ...(prev[fechaSel]?.habitos || {}), [hid]: !prev[fechaSel]?.habitos?.[hid] },
      },
    }));
  };

  const mensaje = () => {
    if (pct === 100 && habitosDia.length > 0) return '¡Día perfecto! 🏆 Eres quien quieres ser.';
    if (pct >= 75) return '¡Casi lo tienes! Solo un poco más 💪';
    if (pct >= 50) return 'Vas por buen camino. Cada hábito cuenta 🎯';
    if (completadosDia > 0) return `${completadosDia} voto${completadosDia > 1 ? 's' : ''} para la persona que quieres ser ✨`;
    return habitosDia.length > 0 ? `${habitosDia.length} hábito${habitosDia.length !== 1 ? 's' : ''} ${esHoy ? 'te esperan hoy' : 'este día'}` : 'Sin hábitos este día 🌅';
  };

  const saludo = () => {
    const h = new Date().getHours();
    if (h < 6) return 'Buenas noches';
    if (h < 13) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div>
      {/* Cabecera con saludo + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: C.textMut }}>{saludo()},</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>
            {perfil?.nombre || 'Hola'} 👋
          </div>
        </div>
        <Avatar nombre={perfil?.nombre} size={48} onClick={onEditarNombre} />
      </div>

      {/* Selector de días */}
      <Card style={{ marginBottom: 20, padding: '14px 14px' }}>
        <DaySelector fechaSel={fechaSel} onSelect={setFechaSel} hoy={HOY} />
      </Card>

      {/* Hero card de progreso */}
      <div style={{
        background: pct === 100 && habitosDia.length ? C.sage : C.yellow,
        borderRadius: 22, padding: '20px', marginBottom: 24, boxShadow: C.shadow,
      }}>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 4, fontWeight: 600 }}>
          {DIAS[dow].charAt(0).toUpperCase() + DIAS[dow].slice(1)}
          {esHoy && ' · hoy'} · {fechaSel.split('-').reverse().slice(0, 2).join('/')}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: habitosDia.length ? 16 : 0 }}>
          {mensaje()}
        </div>
        {habitosDia.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.inkSoft, marginBottom: 6, fontWeight: 600 }}>
              <span>{completadosDia} de {habitosDia.length} completados</span>
              <span>{pct}%</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{
                background: C.ink, width: `${pct}%`, height: '100%', borderRadius: 999,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </>
        )}
      </div>

      {/* Hábitos del día */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader titulo={esHoy ? 'Hábitos de hoy' : 'Hábitos del día'} count={habitosDia.length} />
        {habitosDia.length === 0 ? (
          <EmptyState texto="No hay hábitos programados para este día" emoji="😌" />
        ) : (
          habitosDia.map(h => (
            <HabitoHoyCard
              key={h.id}
              habito={h}
              completado={!!regDia.habitos?.[h.id]}
              racha={calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)}
              onToggle={() => toggleHabito(h.id)}
            />
          ))
        )}
      </section>

      {/* Entrenamiento */}
      {entrenamientosDia.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader titulo="Entrenamiento del día" count={entrenamientosDia.length} color={PASTEL_TEXT[C.yellow]} />
          {entrenamientosDia.map(e => (
            <EntrenamientoHoyCard key={e.id} entrenamiento={e} onRegistrar={() => onRegistrarSesion(e)} />
          ))}
        </section>
      )}

      {/* Vigilancia malos hábitos (solo en hoy) */}
      {esHoy && malosHabitos.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader titulo="Vigilancia · hábitos a romper" count={malosHabitos.length} color={C.danger} />
          {malosHabitos.map(mh => (
            <MaloHabitoHoyCard key={mh.id} mh={mh} fechaRef={HOY} />
          ))}
        </section>
      )}

      {/* Principio del día */}
      <div style={{
        borderRadius: 18, padding: '16px',
        background: C.surfaceAlt,
        fontSize: 13, color: C.textMut, fontStyle: 'italic', lineHeight: 1.6,
      }}>
        "El éxito no es un evento, es un sistema. No subes al nivel de tus objetivos, caes al nivel de tus sistemas."
        <div style={{ marginTop: 6, fontSize: 11, color: C.textFaint, fontStyle: 'normal' }}>— James Clear, Hábitos Atómicos</div>
      </div>
    </div>
  );
}
