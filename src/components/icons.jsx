// Set de iconos SVG (estilo línea, sin emojis)
// Uso: <Icon name="flame" size={20} color="#E9A52C" />

const P = {
  // Navegación / chrome
  calendar: <><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 10h18M8 2v4M16 2v4" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5 11 15l4.5-5" /></>,
  dumbbell: <path d="M6 7v10M18 7v10M3.5 9.5v5M20.5 9.5v5M6 12h12" />,
  chart: <path d="M3 3v18h18M7 15v3M12 9v9M17 6v12" />,
  plus: <path d="M12 5v14M5 12h14" />,
  flame: <path d="M12 2c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.5.6-2.5 1.2-3.3C9.5 7 10 5 9.5 3.5 11 4 12 5 12 2Z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>,
  trash: <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />,
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  link: <path d="M9 15 15 9M10.5 6.5 12 5a4 4 0 0 1 6 6l-1.5 1.5M13.5 17.5 12 19a4 4 0 0 1-6-6l1.5-1.5" />,
  note: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,

  // Categorías de hábitos
  star: <path d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.9 6.6 19.5l1.2-6L3.4 9.3l6-.7L12 3Z" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5ZM6 17h13" />,
  run: <><circle cx="14" cy="5" r="2" /><path d="M12 21l1.5-5L10 13l1-5 4 3 3 1M7 21l2-4" /></>,
  lotus: <path d="M12 21c-4 0-7-2-7-5 2 0 3 .5 4 1.5M12 21c4 0 7-2 7-5-2 0-3 .5-4 1.5M12 21c-2 0-3-3-3-6s2-6 3-7c1 1 3 4 3 7s-1 6-3 6Z" />,
  droplet: <path d="M12 3s6 5.7 6 10a6 6 0 0 1-12 0c0-4.3 6-10 6-10Z" />,
  moon: <path d="M20 14a8 8 0 1 1-9.5-9 7 7 0 0 0 9.5 9Z" />,
  apple: <path d="M12 7c-1-2-3-3-5-2-3 1.5-3 6-1 9 1.2 1.8 2.5 3 4 3M12 7c1-2 3-3 5-2 3 1.5 3 6 1 9-1.2 1.8-2.5 3-4 3M12 7V4c0-1 1-2 2-2" />,
  pencil: <path d="M14 4 20 10 8 22H2v-6L14 4Z" />,
  music: <path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
  code: <path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16" />,
  sunrise: <path d="M12 3v5M4.5 10.5 6 12M18 12l1.5-1.5M2 18h20M5 18a7 7 0 0 1 14 0M8.5 7 12 3.5 15.5 7" />,
  brain: <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 1 5 3 3 0 0 0 3 3V4ZM15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-1 5 3 3 0 0 1-3 3V4Z" />,
  heart: <path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3 1 4 2.5 1-1.5 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20Z" />,
  leaf: <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16ZM4 20c4-6 8-9 12-10" />,
  palette: <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-.5-1.5-.5-2.5S14 14 16 14h2a3 3 0 0 0 3-3c0-4.5-4-8-9-8Z" />,
  bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17 10 7h3l3 10M9 7h5" /></>,
  waves: <path d="M2 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2M2 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />,
  coffee: <path d="M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8ZM17 9h2a2 2 0 0 1 0 5h-2M6 2v2M10 2v2M14 2v2" />,
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  boxing: <path d="M7 5h7a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H9l-2 4M7 5 5 9v4l2 2M7 5h7" />,
  ball: <><circle cx="12" cy="12" r="9" /><path d="M12 3c3 3 3 15 0 18M3 12h18M5 6c4 2 10 2 14 0M5 18c4-2 10-2 14 0" /></>,
};

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 1.9, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {P[name] || P.star}
    </svg>
  );
}

// Listas para los selectores de icono
export const ICONOS_HABITO = [
  'star', 'book', 'run', 'lotus', 'droplet', 'moon', 'apple', 'pencil',
  'target', 'music', 'code', 'sunrise', 'brain', 'heart', 'leaf', 'palette',
  'coffee', 'dumbbell', 'waves', 'zap',
];

export const ICONOS_GYM = [
  'dumbbell', 'run', 'bike', 'waves', 'lotus', 'boxing', 'ball', 'heart', 'zap', 'target',
];
