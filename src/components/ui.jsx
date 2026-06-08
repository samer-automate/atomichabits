// Componentes UI reutilizables

import { useEffect } from 'react';

export const C = {
  green: '#4ade80',
  greenDark: '#22c55e',
  orange: '#fb923c',
  red: '#f87171',
  blue: '#60a5fa',
  purple: '#a78bfa',
  yellow: '#facc15',
  teal: '#2dd4bf',
};

export function Btn({ children, variant = 'primary', onClick, style = {}, disabled = false, small = false, full = false }) {
  const bg = {
    primary: C.green,
    secondary: '#2a2a2a',
    danger: C.red,
    orange: C.orange,
    ghost: 'transparent',
    blue: C.blue,
    purple: C.purple,
  }[variant] || C.green;

  const textColor =
    variant === 'ghost' || variant === 'secondary' ? 'var(--text)' : '#000';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#333' : bg,
        color: disabled ? '#666' : textColor,
        border: variant === 'ghost' ? '1px solid #3a3a3a' : 'none',
        padding: small ? '6px 14px' : '10px 20px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: small ? 13 : 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s, transform 0.1s',
        width: full ? '100%' : undefined,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export function Campo({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputBase = {
  width: '100%',
  background: '#111',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--text)',
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
      onFocus={e => (e.target.style.borderColor = C.green)}
      onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
    />
  );
}

export function Textarea({ style, ...props }) {
  return (
    <textarea
      {...props}
      style={{ ...inputBase, resize: 'vertical', minHeight: 80, ...style }}
      onFocus={e => (e.target.style.borderColor = C.green)}
      onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
    />
  );
}

export function Select({ children, style, ...props }) {
  return (
    <select
      {...props}
      style={{ ...inputBase, ...style }}
      onFocus={e => (e.target.style.borderColor = C.green)}
      onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
    >
      {children}
    </select>
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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16, backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{
        background: '#141414', borderRadius: 16, width: '100%', maxWidth: maxW,
        maxHeight: '90vh', overflowY: 'auto', border: '1px solid #2a2a2a',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, background: '#141414', zIndex: 1,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{titulo}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#666', fontSize: 22,
            cursor: 'pointer', lineHeight: 1, padding: '2px 6px', borderRadius: 6,
          }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function SectionHeader({ titulo, count, color = C.green }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 3, height: 18, background: color, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{titulo}</h2>
      {count !== undefined && (
        <span style={{
          fontSize: 11, background: '#1e1e1e', padding: '2px 8px',
          borderRadius: 12, color: '#666', fontWeight: 600,
        }}>{count}</span>
      )}
    </div>
  );
}

export function EmptyState({ texto, emoji, accion }) {
  return (
    <div style={{
      textAlign: 'center', padding: '32px 20px', background: '#0f0f0f',
      borderRadius: 12, border: '1px dashed #222', color: '#555',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{emoji}</div>
      <div style={{ fontSize: 14 }}>{texto}</div>
      {accion && <div style={{ marginTop: 16 }}>{accion}</div>}
    </div>
  );
}

export function Badge({ texto, color = C.green }) {
  return (
    <span style={{
      background: `${color}20`, color, borderRadius: 20, padding: '2px 10px',
      fontSize: 12, fontWeight: 600,
    }}>{texto}</span>
  );
}

export function ProgressBar({ pct, color = C.green }) {
  return (
    <div style={{ background: '#222', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{
        background: color, width: `${Math.min(100, pct)}%`, height: '100%',
        borderRadius: 4, transition: 'width 0.6s ease',
      }} />
    </div>
  );
}
