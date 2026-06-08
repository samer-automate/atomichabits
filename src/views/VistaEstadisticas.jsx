import { useState, useMemo } from 'react';
import { getHoy, getDow, addDias, diasEntre, calcularRacha, calcularPorcentaje, MESES } from '../utils.js';
import { C, SectionHeader, EmptyState, ProgressBar } from '../components/ui.jsx';

const HOY = getHoy();

function StatBox({ valor, label, color = C.green, sub }) {
  return (
    <div style={{
      background: '#0f0f0f', borderRadius: 12, padding: '18px 14px', textAlign: 'center',
      border: '1px solid #1a1a1a',
    }}>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 12, color: '#555', marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#3a3a3a', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// Heatmap de actividad — cuadrícula de las últimas N semanas
function Heatmap({ habitos, registros, semanas = 14 }) {
  const dias = [];
  for (let i = semanas * 7 - 1; i >= 0; i--) {
    const fecha = addDias(HOY, -i);
    const dow = getDow(fecha);
    const aplicables = habitos.filter(h => h.frecuencia === 'diaria' || (h.diasSemana || []).includes(dow));
    const completados = aplicables.filter(h => registros[fecha]?.habitos?.[h.id]).length;
    const total = aplicables.length;
    const pct = total > 0 ? completados / total : -1; // -1 = sin hábitos ese día
    dias.push({ fecha, pct, completados, total });
  }

  // Agrupar en columnas de 7 días (semanas)
  const columnas = [];
  for (let i = 0; i < semanas; i++) {
    columnas.push(dias.slice(i * 7, (i + 1) * 7));
  }

  const getColor = (pct, esFuturo) => {
    if (esFuturo) return '#0a0a0a';
    if (pct === -1) return '#141414'; // sin hábitos
    if (pct === 0) return '#1a1a1a';
    if (pct < 0.34) return '#14321a';
    if (pct < 0.67) return '#1e5a28';
    if (pct < 1) return '#2a8a38';
    return C.green;
  };

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 3, minWidth: 0 }}>
          {columnas.map((semana, si) => (
            <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {semana.map((dia, di) => (
                <div
                  key={di}
                  title={`${dia.fecha.split('-').reverse().join('/')}: ${dia.completados}/${dia.total}`}
                  style={{
                    width: 16, height: 16, borderRadius: 3,
                    background: getColor(dia.pct, dia.fecha > HOY),
                    border: dia.fecha === HOY ? `1px solid ${C.green}` : 'none',
                    transition: 'background 0.2s',
                    cursor: 'help',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 8, fontSize: 11, color: '#444' }}>
        <span>Menos</span>
        {['#1a1a1a', '#14321a', '#1e5a28', '#2a8a38', C.green].map((c, i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: 2, background: c }} />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}

function HabitoStats({ habito, registros, desde, hasta }) {
  const racha = calcularRacha(habito.id, habito.frecuencia, habito.diasSemana, registros);
  const pct = calcularPorcentaje(habito.id, habito.frecuencia, habito.diasSemana, registros, desde, hasta);

  const color = pct >= 80 ? C.green : pct >= 50 ? C.yellow : pct > 0 ? C.orange : C.red;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 14 }}>{habito.emoji} {habito.nombre}</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {racha > 0 && (
            <span style={{ fontSize: 12, color: racha >= 21 ? C.orange : racha >= 7 ? C.yellow : '#777' }}>
              🔥 {racha}d
            </span>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
        </div>
      </div>
      <ProgressBar pct={pct} color={color} />
    </div>
  );
}

export default function VistaEstadisticas({ habitos, registros, sesiones, malosHabitos }) {
  const [periodo, setPeriodo] = useState('semana');

  const { desde, hasta } = useMemo(() => {
    const hasta = HOY;
    if (periodo === 'semana') {
      // Desde el lunes de esta semana
      const d = new Date(HOY);
      const dow = d.getDay();
      const diasDesdeL = (dow + 6) % 7; // días desde lunes
      d.setDate(d.getDate() - diasDesdeL);
      const desde = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { desde, hasta };
    }
    // Mes actual
    return { desde: HOY.slice(0, 7) + '-01', hasta };
  }, [periodo]);

  // Fechas en rango
  const fechasRango = useMemo(() => {
    const arr = [];
    let f = desde;
    while (f <= hasta) { arr.push(f); f = addDias(f, 1); }
    return arr;
  }, [desde, hasta]);

  // Días con al menos 1 hábito completado
  const diasActivos = fechasRango.filter(f => {
    const reg = registros[f]?.habitos || {};
    return Object.values(reg).some(Boolean);
  }).length;

  // Total hábitos completados en período
  const totalCompletados = fechasRango.reduce((acc, f) => {
    const reg = registros[f]?.habitos || {};
    return acc + Object.values(reg).filter(Boolean).length;
  }, 0);

  // Sesiones en período
  const sesionesRango = sesiones.filter(s => s.fecha >= desde && s.fecha <= hasta);

  // Mejor racha global entre todos los hábitos
  const mejorRachaGlobal = habitos.reduce((max, h) => {
    return Math.max(max, calcularRacha(h.id, h.frecuencia, h.diasSemana, registros));
  }, 0);

  return (
    <div style={{ paddingBottom: 80 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Estadísticas</h1>

      {/* Selector período */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['semana', 'Esta semana'], ['mes', 'Este mes']].map(([v, l]) => (
          <button key={v} onClick={() => setPeriodo(v)} style={{
            flex: 1, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
            background: periodo === v ? '#0f1a2a' : '#111',
            color: periodo === v ? C.blue : '#777',
            fontWeight: periodo === v ? 700 : 400,
            outline: periodo === v ? `1px solid ${C.blue}` : 'none',
            transition: 'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatBox valor={diasActivos} label="días activos" color={C.green} />
        <StatBox valor={totalCompletados} label="completados" color={C.blue} />
        <StatBox valor={mejorRachaGlobal} label="mejor racha" color={C.orange} sub="🔥 días" />
      </div>

      {/* Heatmap */}
      <div style={{
        background: '#131313', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px', marginBottom: 20,
      }}>
        <SectionHeader titulo="Actividad · últimas 14 semanas" color={C.blue} />
        {habitos.length === 0
          ? <EmptyState texto="Crea hábitos para ver tu actividad" emoji="🌱" />
          : <Heatmap habitos={habitos} registros={registros} semanas={14} />
        }
      </div>

      {/* Hábitos por período */}
      {habitos.length > 0 && (
        <div style={{
          background: '#131313', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px', marginBottom: 20,
        }}>
          <SectionHeader titulo={`Hábitos · ${periodo === 'semana' ? 'esta semana' : 'este mes'}`} color={C.green} />
          {[...habitos]
            .sort((a, b) =>
              calcularPorcentaje(b.id, b.frecuencia, b.diasSemana, registros, desde, hasta) -
              calcularPorcentaje(a.id, a.frecuencia, a.diasSemana, registros, desde, hasta)
            )
            .map(h => (
              <HabitoStats key={h.id} habito={h} registros={registros} desde={desde} hasta={hasta} />
            ))}
        </div>
      )}

      {/* Entrenamientos */}
      <div style={{
        background: '#131313', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px', marginBottom: 20,
      }}>
        <SectionHeader titulo="Entrenamientos" color={C.orange} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatBox valor={sesionesRango.length} label={periodo === 'semana' ? 'esta semana' : 'este mes'} color={C.orange} />
          <StatBox valor={sesiones.length} label="total histórico" color={C.orange} />
        </div>
        {sesionesRango.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {sesionesRango.slice(-3).reverse().map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: '1px solid #141414', fontSize: 13,
              }}>
                <span>{s.planEmoji || '💪'} {s.planNombre}</span>
                <span style={{ color: '#555' }}>
                  {s.fecha?.split('-').reverse().join('/')}
                  {s.duracion ? ` · ${s.duracion}m` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Malos hábitos */}
      {malosHabitos.length > 0 && (
        <div style={{
          background: '#131313', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px',
        }}>
          <SectionHeader titulo="Rachas sin recaída" color={C.red} />
          {malosHabitos.map(mh => {
            const dias = Math.max(0, Math.round((new Date(HOY) - new Date(mh.inicioConteo || HOY)) / 86_400_000));
            const color = dias > 30 ? C.green : dias > 7 ? C.yellow : dias > 0 ? C.orange : C.red;
            return (
              <div key={mh.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>🚫 {mh.nombre}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{dias}d</span>
                    <div style={{ fontSize: 11, color: '#444' }}>Mejor: {mh.mejorRacha || 0}d</div>
                  </div>
                </div>
                <ProgressBar
                  pct={mh.mejorRacha > 0 ? Math.min(100, (dias / Math.max(dias, mh.mejorRacha)) * 100) : 100}
                  color={color}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
