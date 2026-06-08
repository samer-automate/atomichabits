import { useState } from 'react';
import { DIAS, getHoy, getDow, calcularRacha } from '../utils.js';
import { C, SectionHeader, EmptyState, Btn, Card, Avatar, DaySelector, IconTile, StreakPill, PASTEL_TEXT } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';
import { HeroIllustration } from '../components/Illustration.jsx';

const HOY = getHoy();

function HabitoHoyCard({ habito, completado, racha, onToggle }) {
  const [animando, setAnimando] = useState(false);
  const handleClick = () => {
    if (!completado) { setAnimando(true); setTimeout(() => setAnimando(false), 600); }
    onToggle();
  };

  return (
    <div onClick={handleClick} style={{
      background: completado ? C.surfaceAlt : C.surface,
      borderRadius: 18, padding: '14px 16px', marginBottom: 10, cursor: 'pointer',
      boxShadow: C.shadow,
      transform: animando ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          background: completado ? C.amber : C.surfaceAlt,
          border: `2px solid ${completado ? C.amber : C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: animando ? `0 0 0 6px ${C.amberSoft}` : 'none',
        }}>
          {completado
            ? <Icon name="check" size={20} color={C.ink} strokeWidth={2.6} />
            : <Icon name={habito.icono || 'star'} size={20} color={C.textMut} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 600,
            color: completado ? C.textFaint : C.text,
            textDecoration: completado ? 'line-through' : 'none',
          }}>{habito.nombre}</div>
          {habito.identidad && (
            <div style={{ fontSize: 12, color: C.success, marginTop: 2 }}>{habito.identidad}</div>
          )}
          {!completado && habito.versionDosMinutos && (
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={12} color={C.textMut} /> 2 min: {habito.versionDosMinutos}
            </div>
          )}
        </div>

        <StreakPill dias={racha} />
      </div>

      {completado && (
        <div style={{
          marginTop: 10, fontSize: 12, color: C.success,
          padding: '7px 11px', background: C.sage, borderRadius: 10,
        }}>
          Un voto más para la persona que quieres ser.
        </div>
      )}
    </div>
  );
}

function EntrenamientoHoyCard({ entrenamiento, onRegistrar }) {
  return (
    <Card style={{ marginBottom: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <IconTile name={entrenamiento.icono || 'dumbbell'} bg={C.amberSoft} color={C.amberDark} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{entrenamiento.nombre}</div>
            <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>
              {entrenamiento.ejercicios?.length || 0} ejercicio{entrenamiento.ejercicios?.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <Btn small onClick={onRegistrar}>Registrar</Btn>
      </div>
    </Card>
  );
}

function MaloHabitoHoyCard({ mh, fechaRef }) {
  const diasSin = Math.max(0, Math.round((new Date(fechaRef) - new Date(mh.inicioConteo || fechaRef)) / 86_400_000));
  return (
    <Card style={{ marginBottom: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15, background: C.blush,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.danger, lineHeight: 1 }}>{diasSin}</span>
          <span style={{ fontSize: 9, color: C.danger, opacity: 0.7 }}>días</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{mh.nombre}</div>
          <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>Mejor racha: {mh.mejorRacha || 0} días</div>
          {mh.sustitucion && <div style={{ fontSize: 11, color: C.success, marginTop: 3 }}>{mh.sustitucion}</div>}
        </div>
      </div>
      {diasSin === 0 && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: C.surfaceAlt, borderRadius: 10, fontSize: 12, color: C.danger }}>
          No falles dos veces seguidas. Mañana es tu oportunidad de recuperarte.
        </div>
      )}
    </Card>
  );
}

export default function VistaHoy({ perfil, onEditarNombre, habitos, malosHabitos, entrenamientos, rutinas, registros, setRegistros, onRegistrarSesion }) {
  const [fechaSel, setFechaSel] = useState(HOY);
  const dow = getDow(fechaSel);
  const esHoy = fechaSel === HOY;

  const habitosDia = habitos.filter(h => h.frecuencia === 'diaria' || (h.diasSemana || []).includes(dow));
  const entrenamientosDia = (rutinas[dow]?.workouts || []).map(wid => entrenamientos.find(e => e.id === wid)).filter(Boolean);

  const regDia = registros[fechaSel] || {};
  const completadosDia = habitosDia.filter(h => regDia.habitos?.[h.id]).length;
  const pct = habitosDia.length ? Math.round((completadosDia / habitosDia.length) * 100) : 0;

  const toggleHabito = (hid) => {
    setRegistros(prev => ({
      ...prev,
      [fechaSel]: { ...prev[fechaSel], habitos: { ...(prev[fechaSel]?.habitos || {}), [hid]: !prev[fechaSel]?.habitos?.[hid] } },
    }));
  };

  const mensaje = () => {
    if (pct === 100 && habitosDia.length > 0) return 'Día perfecto. Eres quien quieres ser.';
    if (pct >= 75) return 'Casi lo tienes, solo un poco más.';
    if (pct >= 50) return 'Vas por buen camino. Cada hábito cuenta.';
    if (completadosDia > 0) return `${completadosDia} voto${completadosDia > 1 ? 's' : ''} para tu mejor versión.`;
    return habitosDia.length > 0 ? 'Empieza el día con una acción mínima.' : 'Disfruta el día.';
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
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: C.textMut }}>{saludo()},</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{perfil?.nombre || 'Hola'}</div>
        </div>
        <Avatar nombre={perfil?.nombre} size={48} onClick={onEditarNombre} />
      </div>

      {/* Selector de días */}
      <Card style={{ marginBottom: 20, padding: 14 }}>
        <DaySelector fechaSel={fechaSel} onSelect={setFechaSel} hoy={HOY} />
      </Card>

      {/* Hero con ilustración */}
      <div style={{ borderRadius: 22, overflow: 'hidden', marginBottom: 24, boxShadow: C.shadow, background: C.surface }}>
        <HeroIllustration height={120} />
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: C.textMut, marginBottom: 4, fontWeight: 600 }}>
            {DIAS[dow].charAt(0).toUpperCase() + DIAS[dow].slice(1)}{esHoy ? ' · hoy' : ''} · {fechaSel.split('-').reverse().slice(0, 2).join('/')}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: habitosDia.length ? 14 : 0 }}>
            {mensaje()}
          </div>
          {habitosDia.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textMut, marginBottom: 6, fontWeight: 600 }}>
                <span>{completadosDia} de {habitosDia.length} completados</span>
                <span style={{ color: pct === 100 ? C.success : C.amberDark }}>{pct}%</span>
              </div>
              <div style={{ background: C.line, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ background: pct === 100 ? C.success : C.amber, width: `${pct}%`, height: '100%', borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hábitos */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader titulo={esHoy ? 'Hábitos de hoy' : 'Hábitos del día'} count={habitosDia.length} />
        {habitosDia.length === 0 ? (
          <EmptyState texto="No hay hábitos programados para este día" icon="leaf" />
        ) : (
          habitosDia.map(h => (
            <HabitoHoyCard key={h.id} habito={h}
              completado={!!regDia.habitos?.[h.id]}
              racha={calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)}
              onToggle={() => toggleHabito(h.id)} />
          ))
        )}
      </section>

      {/* Entrenamiento */}
      {entrenamientosDia.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader titulo="Entrenamiento del día" count={entrenamientosDia.length} color={C.clay} />
          {entrenamientosDia.map(e => (
            <EntrenamientoHoyCard key={e.id} entrenamiento={e} onRegistrar={() => onRegistrarSesion(e)} />
          ))}
        </section>
      )}

      {/* Vigilancia */}
      {esHoy && malosHabitos.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHeader titulo="Hábitos a vigilar" count={malosHabitos.length} color={C.danger} />
          {malosHabitos.map(mh => <MaloHabitoHoyCard key={mh.id} mh={mh} fechaRef={HOY} />)}
        </section>
      )}

      {/* Cita */}
      <div style={{ borderRadius: 18, padding: 16, background: C.surfaceAlt, fontSize: 13, color: C.textMut, fontStyle: 'italic', lineHeight: 1.6 }}>
        "No subes al nivel de tus objetivos, caes al nivel de tus sistemas."
        <div style={{ marginTop: 6, fontSize: 11, color: C.textFaint, fontStyle: 'normal' }}>— James Clear, Hábitos Atómicos</div>
      </div>
    </div>
  );
}
