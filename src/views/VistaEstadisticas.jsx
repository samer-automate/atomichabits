import { useState, useMemo } from 'react';
import { getHoy, getDow, addDias, calcularRacha, calcularPorcentaje } from '../utils.js';
import { C, SectionHeader, EmptyState, ProgressBar, Card, Segmented, PASTEL_TEXT } from '../components/ui.jsx';

const HOY = getHoy();

const PASTELES = [C.yellow, C.sage, C.lavender, C.pink, C.sky, C.taupe];

function StatBox({ valor, label, bg = C.surfaceAlt, sub }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '18px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 12, color: C.textMut, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.textFaint, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// Gráfico de barras redondeadas (estilo referencia)
function BarChart({ datos }) {
  const max = Math.max(...datos.map(d => d.valor), 1);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 180 }}>
      {datos.map((d, i) => {
        const h = Math.max(6, (d.valor / max) * 140);
        const color = PASTELES[i % PASTELES.length];
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: '100%', maxWidth: 56, background: C.line, borderRadius: 999,
              height: 140, display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
            }}>
              <div style={{
                width: '100%', height: h, background: color, borderRadius: 999,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8,
                transition: 'height 0.6s ease',
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: PASTEL_TEXT[color] }}>{d.etiqueta}</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: C.textMut, fontWeight: 600, textAlign: 'center' }}>{d.nombre}</span>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({ habitos, registros, semanas = 14 }) {
  const dias = [];
  for (let i = semanas * 7 - 1; i >= 0; i--) {
    const fecha = addDias(HOY, -i);
    const dow = getDow(fecha);
    const aplicables = habitos.filter(h => h.frecuencia === 'diaria' || (h.diasSemana || []).includes(dow));
    const completados = aplicables.filter(h => registros[fecha]?.habitos?.[h.id]).length;
    const total = aplicables.length;
    const pct = total > 0 ? completados / total : -1;
    dias.push({ fecha, pct, completados, total });
  }

  const columnas = [];
  for (let i = 0; i < semanas; i++) columnas.push(dias.slice(i * 7, (i + 1) * 7));

  const getColor = (pct, esFuturo) => {
    if (esFuturo) return C.surfaceAlt;
    if (pct === -1) return C.surfaceAlt;
    if (pct === 0) return C.line;
    if (pct < 0.34) return '#CFE0BC';
    if (pct < 0.67) return '#A9CC8A';
    if (pct < 1) return '#8DBA66';
    return C.success;
  };

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {columnas.map((semana, si) => (
            <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {semana.map((dia, di) => (
                <div key={di} title={`${dia.fecha.split('-').reverse().join('/')}: ${dia.completados}/${dia.total}`}
                  style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: getColor(dia.pct, dia.fecha > HOY),
                    border: dia.fecha === HOY ? `2px solid ${C.ink}` : 'none',
                    cursor: 'help',
                  }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 10, fontSize: 11, color: C.textMut }}>
        <span>Menos</span>
        {[C.line, '#CFE0BC', '#A9CC8A', '#8DBA66', C.success].map((c, i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}

function HabitoStats({ habito, registros, desde, hasta }) {
  const racha = calcularRacha(habito.id, habito.frecuencia, habito.diasSemana, registros);
  const pct = calcularPorcentaje(habito.id, habito.frecuencia, habito.diasSemana, registros, desde, hasta);
  const color = pct >= 80 ? C.success : pct >= 50 ? C.streak : pct > 0 ? C.danger : C.line;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 14, color: C.text }}>{habito.emoji} {habito.nombre}</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {racha > 0 && <span style={{ fontSize: 12, color: C.streak }}>🔥 {racha}d</span>}
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pct}%</span>
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
      const d = new Date(HOY);
      const dow = d.getDay();
      const diasDesdeL = (dow + 6) % 7;
      d.setDate(d.getDate() - diasDesdeL);
      const desde = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { desde, hasta };
    }
    return { desde: HOY.slice(0, 7) + '-01', hasta };
  }, [periodo]);

  const fechasRango = useMemo(() => {
    const arr = [];
    let f = desde;
    while (f <= hasta) { arr.push(f); f = addDias(f, 1); }
    return arr;
  }, [desde, hasta]);

  const diasActivos = fechasRango.filter(f => {
    const reg = registros[f]?.habitos || {};
    return Object.values(reg).some(Boolean);
  }).length;

  const totalCompletados = fechasRango.reduce((acc, f) => {
    const reg = registros[f]?.habitos || {};
    return acc + Object.values(reg).filter(Boolean).length;
  }, 0);

  const sesionesRango = sesiones.filter(s => s.fecha >= desde && s.fecha <= hasta);

  const mejorRachaGlobal = habitos.reduce((max, h) =>
    Math.max(max, calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)), 0);

  // Top hábitos para el gráfico de barras
  const barras = [...habitos]
    .map(h => ({
      nombre: (h.nombre || '').split(' ')[0].slice(0, 8),
      valor: calcularPorcentaje(h.id, h.frecuencia, h.diasSemana, registros, desde, hasta),
      etiqueta: calcularPorcentaje(h.id, h.frecuencia, h.diasSemana, registros, desde, hasta) + '%',
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 4);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: C.text }}>Estadísticas</h1>

      <div style={{ marginBottom: 20 }}>
        <Segmented
          opciones={[{ id: 'semana', label: 'Esta semana' }, { id: 'mes', label: 'Este mes' }]}
          valor={periodo}
          onChange={setPeriodo}
        />
      </div>

      {/* Número hero */}
      <Card style={{ marginBottom: 20, textAlign: 'center', padding: '24px 16px' }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: C.text, lineHeight: 1 }}>{totalCompletados}</div>
        <div style={{ fontSize: 14, color: C.textMut, marginTop: 6 }}>
          hábitos completados {periodo === 'semana' ? 'esta semana' : 'este mes'} 🎉
        </div>
      </Card>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatBox valor={diasActivos} label="días activos" bg={C.sage} />
        <StatBox valor={sesionesRango.length} label="entrenos" bg={C.yellow} />
        <StatBox valor={mejorRachaGlobal} label="mejor racha" bg={C.pink} sub="🔥 días" />
      </div>

      {/* Gráfico de barras */}
      {barras.length > 0 && barras.some(b => b.valor > 0) && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader titulo="Top hábitos" color={PASTEL_TEXT[C.yellow]} />
          <BarChart datos={barras} />
        </Card>
      )}

      {/* Heatmap */}
      <Card style={{ marginBottom: 20 }}>
        <SectionHeader titulo="Actividad · últimas 14 semanas" color={C.success} />
        {habitos.length === 0
          ? <EmptyState texto="Crea hábitos para ver tu actividad" emoji="🌱" />
          : <Heatmap habitos={habitos} registros={registros} semanas={14} />}
      </Card>

      {/* Hábitos por período */}
      {habitos.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader titulo={`Hábitos · ${periodo === 'semana' ? 'esta semana' : 'este mes'}`} />
          {[...habitos]
            .sort((a, b) =>
              calcularPorcentaje(b.id, b.frecuencia, b.diasSemana, registros, desde, hasta) -
              calcularPorcentaje(a.id, a.frecuencia, a.diasSemana, registros, desde, hasta))
            .map(h => <HabitoStats key={h.id} habito={h} registros={registros} desde={desde} hasta={hasta} />)}
        </Card>
      )}

      {/* Entrenamientos recientes */}
      {sesionesRango.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader titulo="Entrenamientos recientes" color={PASTEL_TEXT[C.yellow]} />
          {sesionesRango.slice(-3).reverse().map(s => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: `1px solid ${C.line}`, fontSize: 13, color: C.text,
            }}>
              <span>{s.planEmoji || '💪'} {s.planNombre}</span>
              <span style={{ color: C.textMut }}>
                {s.fecha?.split('-').reverse().join('/')}{s.duracion ? ` · ${s.duracion}m` : ''}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* Malos hábitos */}
      {malosHabitos.length > 0 && (
        <Card>
          <SectionHeader titulo="Rachas sin recaída" color={C.danger} />
          {malosHabitos.map(mh => {
            const dias = Math.max(0, Math.round((new Date(HOY) - new Date(mh.inicioConteo || HOY)) / 86_400_000));
            return (
              <div key={mh.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: C.text }}>🚫 {mh.nombre}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{dias}d</span>
                    <div style={{ fontSize: 11, color: C.textFaint }}>Mejor: {mh.mejorRacha || 0}d</div>
                  </div>
                </div>
                <ProgressBar
                  pct={mh.mejorRacha > 0 ? Math.min(100, (dias / Math.max(dias, mh.mejorRacha)) * 100) : 100}
                  color={dias > 7 ? C.success : C.streak}
                />
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
