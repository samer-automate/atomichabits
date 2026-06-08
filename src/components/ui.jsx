// Componentes UI reutilizables — tema claro/cálido, acento ámbar

import { useEffect } from 'react';
import { Icon } from './icons.jsx';

export const C = {
  // Acento de marca (ámbar/dorado)
  amber: '#E9A52C', amberDark: '#C8861A', amberSoft: '#FBE8C0',
  // Tinta / texto
  ink: '#241E16', text: '#241E16', textMut: '#8C857A', textFaint: '#B6AEA2',
  // Fondo y superficies
  bg: '#F4F1EA', surface: '#FFFFFF', surfaceAlt: '#FAF7F1',
  line: '#ECE7DD',
  // Semánticos
  success: '#7E9A4E', streak: '#E9A52C', danger: '#C2603C',
  // Tonos tierra / categoría (tarjetas y barras)
  clay: '#C97B4A', olive: '#8A9A4E', brown: '#6E4B2A', taupe: '#5E5B50',
  sage: '#DDE6CC', cream: '#F6E6C0', blush: '#F3DCD0', mist: '#E2DED4',
  shadow: '0 6px 22px rgba(70,55,30,0.06)',
  shadowLg: '0 18px 50px rgba(70,55,30,0.16)',
};

// Color de texto legible sobre fondos pastel
export const PASTEL_TEXT = {
  [C.sage]: '#56702F', [C.cream]: '#9A6A12', [C.blush]: '#A8533A', [C.mist]: '#6A6555',
  [C.amberSoft]: '#9A6A12',
};

export function Btn({ children, variant = 'primary', onClick, style = {}, disabled = false, small = false, full = false }) {
  const variantes = {
    primary:   { bg: C.amber, color: C.ink, border: 'none', shadow: true },
    secondary: { bg: C.surfaceAlt, color: C.text, border: `1px solid ${C.line}`, shadow: false },
    danger:    { bg: C.danger, color: '#fff', border: 'none', shadow: true },
    success:   { bg: C.success, color: '#fff', border: 'none', shadow: true },
    ghost:     { bg: 'transparent', color: C.text, border: `1px solid ${C.line}`, shadow: false },
    dark:      { bg: C.ink, color: '#fff', border: 'none', shadow: true },
  };
  // legados → ámbar
  const v = variantes[variant] || variantes.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? C.line : v.bg,
        color: disabled ? C.textFaint : v.color,
        border: disabled ? 'none' : v.border,
        padding: small ? '8px 16px' : '12px 22px',
        borderRadius: 999,
        fontWeight: 600,
        fontSize: small ? 13 : 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: !disabled && v.shadow ? C.shadow : 'none',
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
    <input {...props} style={{ ...inputBase, ...style }}
      onFocus={e => (e.target.style.borderColor = C.amber)}
      onBlur={e => (e.target.style.borderColor = C.line)} />
  );
}

export function Textarea({ style, ...props }) {
  return (
    <textarea {...props} style={{ ...inputBase, resize: 'vertical', minHeight: 80, ...style }}
      onFocus={e => (e.target.style.borderColor = C.amber)}
      onBlur={e => (e.target.style.borderColor = C.line)} />
  );
}

export function Select({ children, style, ...props }) {
  return (
    <select {...props} style={{ ...inputBase, ...style }}
      onFocus={e => (e.target.style.borderColor = C.amber)}
      onBlur={e => (e.target.style.borderColor = C.line)}>
      {children}
    </select>
  );
}

export function Card({ children, style = {}, onClick, bg = C.surface }) {
  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: 20, boxShadow: C.shadow, padding: 16, ...style,
    }}>
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
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(45,35,20,0.34)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16, backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: C.surface, borderRadius: 24, width: '100%', maxWidth: maxW,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: C.shadowLg,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${C.line}`, position: 'sticky', top: 0, background: C.surface, zIndex: 1,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{titulo}</h2>
          <button onClick={onClose} style={{
            background: C.surfaceAlt, border: 'none', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="x" size={16} color={C.textMut} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function ActionSheet({ titulo, opciones, onClose }) {
  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(45,35,20,0.34)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: C.surface, borderRadius: '26px 26px 0 0', width: '100%', maxWidth: 560,
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
              width: 44, height: 44, borderRadius: 13, background: op.color || C.amberSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><Icon name={op.icon} size={22} color={op.iconColor || C.ink} /></span>
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

export function SectionHeader({ titulo, count, color = C.amber }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
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

export function EmptyState({ texto, icon = 'leaf', accion }) {
  return (
    <div style={{
      textAlign: 'center', padding: '36px 20px', background: C.surfaceAlt,
      borderRadius: 18, border: `1px dashed ${C.line}`, color: C.textMut,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: C.surface, margin: '0 auto 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadow,
      }}>
        <Icon name={icon} size={26} color={C.amber} />
      </div>
      <div style={{ fontSize: 14 }}>{texto}</div>
      {accion && <div style={{ marginTop: 16 }}>{accion}</div>}
    </div>
  );
}

export function Badge({ texto, color = C.amberSoft, textColor }) {
  return (
    <span style={{
      background: color, color: textColor || PASTEL_TEXT[color] || C.text, borderRadius: 20, padding: '3px 10px',
      fontSize: 12, fontWeight: 700,
    }}>{texto}</span>
  );
}

export function ProgressBar({ pct, color = C.amber }) {
  return (
    <div style={{ background: C.line, borderRadius: 999, height: 8, overflow: 'hidden' }}>
      <div style={{
        background: color, width: `${Math.min(100, pct)}%`, height: '100%',
        borderRadius: 999, transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

// Pastilla con racha (icono llama + número)
export function StreakPill({ dias, size = 13 }) {
  if (!dias) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: C.amber, fontWeight: 700, fontSize: size }}>
      <Icon name="flame" size={size + 2} color={C.amber} fill={C.amberSoft} />
      {dias}
    </span>
  );
}

export function Avatar({ nombre, size = 44, onClick }) {
  const inicial = (nombre || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', background: C.amber,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: C.ink, flexShrink: 0,
      cursor: onClick ? 'pointer' : 'default', boxShadow: C.shadow,
      border: `2px solid ${C.surface}`,
    }}>
      {inicial}
    </div>
  );
}

const DIAS_MINI = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export function DaySelector({ fechaSel, onSelect, hoy }) {
  const [y, m, d] = fechaSel.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const dow = base.getDay();
  const offsetLunes = (dow + 6) % 7;
  const semana = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(y, m - 1, d - offsetLunes + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    semana.push({ iso, dia: dt.getDate(), label: DIAS_MINI[i] });
  }

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
      {semana.map(({ iso, dia, label }) => {
        const sel = iso === fechaSel;
        const esHoy = iso === hoy;
        return (
          <button key={iso} onClick={() => onSelect(iso)} style={{
            flex: 1, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 0,
          }}>
            <span style={{ fontSize: 11, color: sel ? C.text : C.textFaint, fontWeight: 600 }}>{label}</span>
            <span style={{
              width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
              background: sel ? C.amber : 'transparent',
              color: sel ? C.ink : C.text,
              transition: 'all 0.2s',
            }}>{dia}</span>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: esHoy && !sel ? C.amber : 'transparent',
            }} />
          </button>
        );
      })}
    </div>
  );
}

export function Segmented({ opciones, valor, onChange }) {
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
            boxShadow: sel ? C.shadow : 'none', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {op.icon && <Icon name={op.icon} size={16} color={sel ? C.amber : C.textMut} />}
            {op.label}
          </button>
        );
      })}
    </div>
  );
}

// Cuadro de icono con fondo pastel (sustituye los emojis de categoría)
export function IconTile({ name, size = 46, bg = C.amberSoft, color = C.amberDark, radius = 13 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon name={name} size={size * 0.5} color={color} />
    </div>
  );
}
