// Utilidades generales de la aplicación

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const DIAS_C = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Devuelve la fecha de hoy en formato YYYY-MM-DD
export const getHoy = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

// Día de la semana (0=domingo) de una fecha 'YYYY-MM-DD'
export const getDow = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

// Suma n días a una fecha 'YYYY-MM-DD'
export const addDias = (s, n) => {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// Días entre dos fechas 'YYYY-MM-DD'
export const diasEntre = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86_400_000);

// ID único
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Calcula racha actual de un hábito
export const calcularRacha = (habitoId, frecuencia, diasSemana, registros) => {
  let racha = 0;
  const hoy = getHoy();
  const completadoHoy = !!registros[hoy]?.habitos?.[habitoId];

  // Si no lo ha completado hoy, la racha empieza desde ayer
  let fecha = completadoHoy ? hoy : addDias(hoy, -1);

  for (let i = 0; i < 365; i++) {
    const dow = getDow(fecha);
    const aplica =
      frecuencia === 'diaria' || (diasSemana || []).includes(dow);

    if (!aplica) {
      fecha = addDias(fecha, -1);
      continue;
    }

    if (registros[fecha]?.habitos?.[habitoId]) {
      racha++;
      fecha = addDias(fecha, -1);
    } else {
      break;
    }
  }
  return racha;
};

// Porcentaje de cumplimiento en un rango de fechas
export const calcularPorcentaje = (habitoId, frecuencia, diasSemana, registros, desde, hasta) => {
  const fechas = [];
  let f = desde;
  while (f <= hasta) {
    fechas.push(f);
    f = addDias(f, 1);
  }
  const aplicables = fechas.filter(fecha => {
    const dow = getDow(fecha);
    return frecuencia === 'diaria' || (diasSemana || []).includes(dow);
  });
  if (!aplicables.length) return 0;
  const completados = aplicables.filter(fecha => registros[fecha]?.habitos?.[habitoId]).length;
  return Math.round((completados / aplicables.length) * 100);
};
