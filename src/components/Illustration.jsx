// Ilustración plana para la tarjeta hero (sol sobre colinas)
// Estilo flat inspirado en la referencia, en SVG (sin imágenes externas).

export function HeroIllustration({ height = 130 }) {
  return (
    <svg viewBox="0 0 320 130" width="100%" height={height} preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', borderRadius: 16 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6D38A" />
          <stop offset="1" stopColor="#F3C56B" />
        </linearGradient>
      </defs>

      {/* Cielo */}
      <rect x="0" y="0" width="320" height="130" fill="url(#sky)" />

      {/* Sol con rayos */}
      <g transform="translate(160 58)">
        {[...Array(12)].map((_, i) => {
          const a = (i * 30) * Math.PI / 180;
          const r1 = 26, r2 = 34;
          return (
            <line key={i}
              x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
              stroke="#EE9F3D" strokeWidth="2.4" strokeLinecap="round" />
          );
        })}
        <circle r="20" fill="#F08C32" />
        {/* carita */}
        <circle cx="-6" cy="-2" r="1.8" fill="#3a2410" />
        <circle cx="6" cy="-2" r="1.8" fill="#3a2410" />
        <path d="M-6 5 Q0 9 6 5" stroke="#3a2410" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>

      {/* Nubes */}
      <g fill="#FBEAC4" opacity="0.9">
        <ellipse cx="55" cy="34" rx="20" ry="7" />
        <ellipse cx="270" cy="26" rx="24" ry="8" />
      </g>

      {/* Pájaros */}
      <g stroke="#C8862C" strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d="M40 60 q4 -4 8 0 q4 -4 8 0" />
        <path d="M250 50 q3 -3 6 0 q3 -3 6 0" />
      </g>

      {/* Colinas traseras */}
      <path d="M0 130 V96 Q60 72 130 92 Q210 116 320 88 V130 Z" fill="#A9C16A" />
      {/* Colinas delanteras */}
      <path d="M0 130 V108 Q70 90 150 106 Q240 124 320 104 V130 Z" fill="#7FA64A" />

      {/* Arbolitos */}
      <g fill="#5E8438">
        <path d="M48 110 l7 -16 l7 16 Z" />
        <path d="M44 116 l9 -20 l9 20 Z" />
        <path d="M264 104 l6 -14 l6 14 Z" />
        <path d="M272 108 l7 -16 l7 16 Z" />
      </g>
    </svg>
  );
}
