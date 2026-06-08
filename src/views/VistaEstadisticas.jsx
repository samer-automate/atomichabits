import { useState, useMemo } from 'react';
import { getHoy, getDow, addDias, calcularRacha, calcularPorcentaje } from '../utils.js';
import { C, SectionHeader, EmptyState, ProgressBar, Card, Segmented, StreakPill } from '../components/ui.jsx';

const HOY = getHoy();

// Paleta tierra para las barras (estilo referencia)
const BAR_COLORS = [C.amber, C.brown, C.olive, C.clay, C.taupe, C.success];

function StatBox({ valor, label, bg = C.surfaceAlt, color = C.text }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '18px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{valor}</div>
      <div style={{ fontSize: 12, color: C.textMut, marginTop: 5 }}>{label}</div>
    </div>
  );
}

// Gráfico de barras redondeadas
function BarChart({ datos }) {
  const max = Math.max(...datos.map(d => d.valor), 1);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      {datos.map((d, i) => {
        const h = Math.max(34, (d.valor / max) * 150);
        const color = BAR_COLORS[i % BAR_COLORS.length];
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: '100%', maxWidth: 58, background: C.surfaceAlt, borderRadius: 999, height: 160, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
              <div style={{
                width: '100%', height: h, background: color, borderRadius: 999,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10, transition: 'height 0.6s ease',
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{d.valor}%</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: C.textMut, fontWeight: 600, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</span>
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
    dias.push({ fecha, pct: total > 0 ? completados / total : -1, completados, total });
  }
  const columnas = [];
  for (let i = 0; i < semanas; i++) columnas.push(dias.slice(i * 7, (i + 1) * 7));

  const getColor = (pct, fut) => {
    if (fut || pct === -1) return C.surfaceAlt;
    if (pct === 0) return C.line;
    if (pct < 0.34) return '#F3DDA8';
    if (pct < 0.67) return '#EFC368';
    if (pct < 1) return '#E9A52C';
    return C.amberDark;
  };

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {columnas.map((semana, si) => (
            <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {semana.map((dia, di) => (
                <div key={di} title={`${dia.fecha.split('-').reverse().join('/')}: ${dia.completados}/${dia.total}`}
                  style={{ width: 16, height: 16, borderRadius: 4, background: getColor(dia.pct, dia.fecha > HOY), border: dia.fecha === HOY ? `2px solid ${C.ink}` : 'none', cursor: 'help' }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 10, fontSize: 11, color: C.textMut }}>
        <span>Menos</span>
        {[C.line, '#F3DDA8', '#EFC368', '#E9A52C', C.amberDark].map((c, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />)}
        <span>Más</span>
      </div>
    </div>
  );
}

function HabitoStats({ habito, registros, desde, hasta }) {
  const racha = calcularRacha(habito.id, habito.frecuencia, habito.diasSemana, registros);
  const pct = calcularPorcentaje(habito.id, habito.frecuencia, habito.diasSemana, registros, desde, hasta);
  const color = pct >= 80 ? C.success : pct >= 50 ? C.amber : pct > 0 ? C.clay : C.line;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 14, color: C.text }}>{habito.nombre}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <StreakPill dias={racha} size={12} />
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
      const d = new Date(HOY); const dow = d.getDay();
      d.setDate(d.getDate() - ((dow + 6) % 7));
      const desde = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { desde, hasta };
    }
    return { desde: HOY.slice(0, 7) + '-01', hasta };
  }, [periodo]);

  const fechasRango = useMemo(() => { const arr = []; let f = desde; while (f <= hasta) { arr.push(f); f = addDias(f, 1); } return arr; }, [desde, hasta]);

  const diasActivos = fechasRango.filter(f => Object.values(registros[f]?.habitos || {}).some(Boolean)).length;
  const totalCompletados = fechasRango.reduce((acc, f) => acc + Object.values(registros[f]?.habitos || {}).filter(Boolean).length, 0);
  const sesionesRango = sesiones.filter(s => s.fecha >= desde && s.fecha <= hasta);
  const mejorRachaGlobal = habitos.reduce((max, h) => Math.max(max, calcularRacha(h.id, h.frecuencia, h.diasSemana, registros)), 0);

  const barras = [...habitos]
    .map(h => ({ nombre: (h.nombre || '').split(' ')[0], valor: calcularPorcentaje(h.id, h.frecuencia, h.diasSemana, registros, desde, hasta) }))
    .sort((a, b) => b.valor - a.valor).slice(0, 4);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: C.text }}>Estadísticas</h1>

      <div style={{ marginBottom: 20 }}>
        <Segmented opciones={[{ id: 'semana', label: 'Esta semana' }, { id: 'mes', label: 'Este mes' }]} valor={periodo} onChange={setPeriodo} />
      </div>

      {/* Número hero */}
      <Card style={{ marginBottom: 20, textAlign: 'center', padding: '26px 16px' }}>
        <div style={{ fontSize: 58, fontWeight: 800, color: C.text, lineHeight: 1 }}>{totalCompletados}</div>
        <div style={{ fontSize: 14, color: C.textMut, marginTop: 8 }}>
          hábitos completados {periodo === 'semana' ? 'esta semana' : 'este mes'}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatBox valor={diasActivos} label="días activos" bg={C.sage} color={C.success} />
        <StatBox valor={sesionesRango.length} label="entrenos" bg={C.amberSoft} color={C.amberDark} />
        <StatBox valor={mejorRachaGlobal} label="mejor racha" bg={C.blush} color={C.danger} />
      </div>

      {barras.length > 0 && barras.some(b => b.valor > 0) && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader titulo="Top hábitos" color={C.amber} />
          <BarChart datos={barras} />
        </Card>
      )}

      <Card style={{ marginBottom: 20 }}>
        <SectionHeader titulo="Actividad · últimas 14 semanas" color={C.amber} />
        {habitos.length === 0 ? <EmptyState texto="Crea hábitos para ver tu actividad" icon="leaf" /> : <Heatmap habitos={habitos} registros={registros} />}
      </Card>

      {habitos.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader titulo={`Hábitos · ${periodo === 'semana' ? 'esta semana' : 'este mes'}`} />
          {[...habitos]
            .sort((a, b) => calcularPorcentaje(b.id, b.frecuencia, b.diasSemana, registros, desde, hasta) - calcularPorcentaje(a.id, a.frecuencia, a.diasSemana, registros, desde, hasta))
            .map(h => <HabitoStats key={h.id} habito={h} registros={registros} desde={desde} hasta={hasta} />)}
        </Card>
      )}

      {sesionesRango.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <SectionHeader titulo="Entrenamientos recientes" color={C.clay} />
          {sesionesRango.slice(-3).reverse().map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.line}`, fontSize: 13, color: C.text }}>
              <span>{s.planNombre}</span>
              <span style={{ color: C.textMut }}>{s.fecha?.split('-').reverse().join('/')}{s.duracion ? ` · ${s.duracion}m` : ''}</span>
            </div>
          ))}
        </Card>
      )}

      {malosHabitos.length > 0 && (
        <Card>
          <SectionHeader titulo="Rachas sin recaída" color={C.danger} />
          {malosHabitos.map(mh => {
            const dias = Math.max(0, Math.round((new Date(HOY) - new Date(mh.inicioConteo || HOY)) / 86_400_000));
            return (
              <div key={mh.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: C.text }}>{mh.nombre}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{dias}d</span>
                    <div style={{ fontSize: 11, color: C.textFaint }}>Mejor: {mh.mejorRacha || 0}d</div>
                  </div>
                </div>
                <ProgressBar pct={mh.mejorRacha > 0 ? Math.min(100, (dias / Math.max(dias, mh.mejorRacha)) * 100) : 100} color={dias > 7 ? C.success : C.amber} />
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
