'use client';
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const sizeMap: Record<Size, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius-full)' as any },
  md: { padding: '12px 22px', fontSize: 14, borderRadius: 'var(--radius-full)' as any },
  lg: { padding: '15px 28px', fontSize: 15, borderRadius: 'var(--radius-full)' as any },
};

const variantMap: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' },
  secondary: { background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--border-strong)' },
  ghost:     { background: 'transparent', color: 'var(--ink)', border: '1px solid transparent' },
  danger:    { background: 'var(--error)', color: '#fff', border: '1px solid var(--error)' },
  accent:    { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
};

export function Button({ variant = 'primary', size = 'md', fullWidth, children, style, disabled, ...rest }: Props) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hover && !disabled ? 'var(--shadow-md)' : 'none',
        ...sizeMap[size], ...variantMap[variant], ...style,
      }}
    >
      {children}
    </button>
  );
}
