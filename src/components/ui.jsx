// Componentes UI reutilizables — tema claro/cálido

import { useEffect, useState } from 'react';

export const C = {
  // Marca / acento (negro)
  ink: '#1A1A1A', inkSoft: '#3A352E',
  // Fondo y superficies
  bg: '#F5F2EC', surface: '#FFFFFF', surfaceAlt: '#FBF9F5',
  // Texto (gris cálido)
  text: '#1F1B16', textMut: '#8A857C', textFaint: '#B5AFA4',
  line: '#ECE7DE',
  // Semánticos
  success: '#7FB069', streak: '#E8A33D', danger: '#E07A5F',
  // Pasteles de categoría (fondos de tarjeta y barras de gráfico)
  yellow: '#FBE8C0', pink: '#F7DAD6', lavender: '#E6DDF5',
  sage: '#DCE7CD', taupe: '#EAE4DA', sky: '#D6E6F2',
  shadow: '0 6px 22px rgba(60,50,30,0.07)',
  shadowLg: '0 16px 50px rgba(60,50,30,0.14)',
};

// Pasteles "fuertes" para texto sobre pastel claro
export const PASTEL_TEXT = {
  [C.yellow]: '#9a6a12', [C.pink]: '#a8463f', [C.lavender]: '#6a52a8',
  [C.sage]: '#5a7a3a', [C.taupe]: '#7a6f5a', [C.sky]: '#3a6a96',
};

export function Btn({ children, variant = 'primary', onClick, style = {}, disabled = false, small = false, full = false }) {
  const variantes = {
    primary:   { bg: C.ink,    color: '#fff',    border: 'none' },
    secondary: { bg: C.surfaceAlt, color: C.text, border: `1px solid ${C.line}` },
    danger:    { bg: C.danger, color: '#fff',    border: 'none' },
    success:   { bg: C.success, color: '#fff',   border: 'none' },
    ghost:     { bg: 'transparent', color: C.text, border: `1px solid ${C.line}` },
    yellow:    { bg: C.yellow, color: PASTEL_TEXT[C.yellow], border: 'none' },
    sage:      { bg: C.sage,   color: PASTEL_TEXT[C.sage],   border: 'none' },
    lavender:  { bg: C.lavender, color: PASTEL_TEXT[C.lavender], border: 'none' },
  };
  // 'orange' / 'blue' / 'purple' legados → mapear a pasteles
  const v = variantes[variant] || (
    variant === 'orange' ? variantes.yellow :
    variant === 'blue' ? { bg: C.sky, color: PASTEL_TEXT[C.sky], border: 'none' } :
    variant === 'purple' ? variantes.lavender :
    variantes.primary
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? C.line : v.bg,
        color: disabled ? C.textFaint : v.color,
        border: disabled ? 'none' : v.border,
        padding: small ? '7px 16px' : '11px 22px',
        borderRadius: 999,
        fontWeight: 600,
        fontSize: small ? 13 : 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled || variant === 'ghost' ? 'none' : C.shadow,
        transition: 'opacity 0.2s, transform 0.1s',
        width: full ? '100%' : undefined,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export function Campo({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, color: C.textMut, marginBottom: 6, fontWeight: 600 }}>
        {label}{required && <span style={{ color: C.danger }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputBase = {
  width: '100%',
  background: C.surfaceAlt,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: '11px 14px',
  color: C.text,
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};

export function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...style }}
      onFocus={e => (e.target.style.borderColor = C.ink)}
      onBlur={e => (e.target.style.borderColor = C.line)}
    />
  );
}

export function Textarea({ style, ...props }) {
  return (
    <textarea
      {...props}
      style={{ ...inputBase, resize: 'vertical', minHeight: 80, ...style }}
      onFocus={e => (e.target.style.borderColor = C.ink)}
      onBlur={e => (e.target.style.borderColor = C.line)}
    />
  );
}

export function Select({ children, style, ...props }) {
  return (
    <select
      {...props}
      style={{ ...inputBase, ...style }}
      onFocus={e => (e.target.style.borderColor = C.ink)}
      onBlur={e => (e.target.style.borderColor = C.line)}
    >
      {children}
    </select>
  );
}

// Envoltorio de tarjeta estándar
export function Card({ children, style = {}, onClick, bg = C.surface }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: bg, borderRadius: 20, boxShadow: C.shadow,
        padding: 16, ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Modal({ titulo, onClose, children, size = 'md' }) {
  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const maxW = size === 'lg' ? 680 : size === 'sm' ? 360 : 500;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(40,32,20,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16, backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        background: C.surface, borderRadius: 22, width: '100%', maxWidth: maxW,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: C.shadowLg,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0, background: C.surface, zIndex: 1,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{titulo}</h2>
          <button onClick={onClose} style={{
            background: C.surfaceAlt, border: 'none', color: C.textMut, fontSize: 18,
            cursor: 'pointer', lineHeight: 1, width: 32, height: 32, borderRadius: '50%',
          }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// Hoja de acción inferior deslizante
export function ActionSheet({ titulo, opciones, onClose }) {
  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(40,32,20,0.32)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: C.surface, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560,
        padding: '12px 16px calc(20px + env(safe-area-inset-bottom, 0))', boxShadow: C.shadowLg,
        animation: 'sheetUp 0.25s ease',
      }}>
        <div style={{ width: 40, height: 4, background: C.line, borderRadius: 4, margin: '4px auto 14px' }} />
        {titulo && <div style={{ fontSize: 14, fontWeight: 700, color: C.textMut, marginBottom: 12, textAlign: 'center' }}>{titulo}</div>}
        {opciones.map((op, i) => (
          <button key={i} onClick={() => { op.onClick(); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            background: C.surfaceAlt, border: 'none', borderRadius: 16,
            padding: '14px 16px', marginBottom: 8, cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{
              width: 42, height: 42, borderRadius: 12, background: op.color || C.yellow,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>{op.emoji}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: C.text }}>{op.label}</span>
              {op.desc && <span style={{ display: 'block', fontSize: 12, color: C.textMut, marginTop: 1 }}>{op.desc}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SectionHeader({ titulo, count, color = C.ink }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 4, height: 18, background: color, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ fontSize: 16, fontWeight: 700, flex: 1, color: C.text }}>{titulo}</h2>
      {count !== undefined && (
        <span style={{
          fontSize: 11, background: C.surfaceAlt, padding: '3px 9px',
          borderRadius: 12, color: C.textMut, fontWeight: 600,
        }}>{count}</span>
      )}
    </div>
  );
}

export function EmptyState({ texto, emoji, accion }) {
  return (
    <div style={{
      textAlign: 'center', padding: '36px 20px', background: C.surfaceAlt,
      borderRadius: 18, border: `1px dashed ${C.line}`, color: C.textMut,
    }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontSize: 14 }}>{texto}</div>
      {accion && <div style={{ marginTop: 16 }}>{accion}</div>}
    </div>
  );
}

export function Badge({ texto, color = C.yellow, textColor }) {
  return (
    <span style={{
      background: color, color: textColor || PASTEL_TEXT[color] || C.text, borderRadius: 20, padding: '3px 10px',
      fontSize: 12, fontWeight: 700,
    }}>{texto}</span>
  );
}

export function ProgressBar({ pct, color = C.ink }) {
  return (
    <div style={{ background: C.line, borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div style={{
        background: color, width: `${Math.min(100, pct)}%`, height: '100%',
        borderRadius: 999, transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

// Avatar circular con iniciales sobre fondo pastel
export function Avatar({ nombre, size = 44, onClick }) {
  const inicial = (nombre || '?').trim().charAt(0).toUpperCase() || '?';
  const pasteles = [C.yellow, C.pink, C.lavender, C.sage, C.sky];
  const idx = (inicial.charCodeAt(0) || 0) % pasteles.length;
  const bg = pasteles[idx];
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: PASTEL_TEXT[bg], flexShrink: 0,
      cursor: onClick ? 'pointer' : 'default', boxShadow: C.shadow,
    }}>
      {inicial}
    </div>
  );
}

// Selector de días de la semana (fila con badges circulares)
const DIAS_MINI = ['L', 'M', 'X', 'J', 'V', 'S', 'D']; // lun→dom visual
export function DaySelector({ fechaSel, onSelect, hoy }) {
  // Construye la semana (lunes a domingo) que contiene fechaSel
  const [y, m, d] = fechaSel.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const dow = base.getDay(); // 0=dom
  const offsetLunes = (dow + 6) % 7;
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(y, m - 1, d - offsetLunes + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    semana.push({ iso, dia: dt.getDate(), label: DIAS_MINI[i] });
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
      {semana.map(({ iso, dia, label }) => {
        const sel = iso === fechaSel;
        const esHoy = iso === hoy;
        return (
          <button key={iso} onClick={() => onSelect(iso)} style={{
            flex: 1, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 0,
          }}>
            <span style={{ fontSize: 11, color: sel ? C.text : C.textMut, fontWeight: 600 }}>{label}</span>
            <span style={{
              width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
              background: sel ? C.ink : 'transparent',
              color: sel ? '#fff' : C.text,
              border: !sel && esHoy ? `2px solid ${C.streak}` : 'none',
              transition: 'all 0.2s',
            }}>{dia}</span>
          </button>
        );
      })}
    </div>
  );
}

// Selector segmentado tipo pill
export function Segmented({ opciones, valor, onChange, color = C.ink }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.surfaceAlt, borderRadius: 999, padding: 4 }}>
      {opciones.map(op => {
        const sel = valor === op.id;
        return (
          <button key={op.id} onClick={() => onChange(op.id)} style={{
            flex: 1, padding: '9px 8px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: sel ? C.surface : 'transparent',
            color: sel ? C.text : C.textMut,
            fontWeight: sel ? 700 : 500, fontSize: 13,
            boxShadow: sel ? C.shadow : 'none',
            transition: 'all 0.2s',
          }}>{op.label}</button>
        );
      })}
    </div>
  );
}
