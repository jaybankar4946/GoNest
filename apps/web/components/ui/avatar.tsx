import * as React from 'react';

export function Avatar({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className ?? ''}`}>{children}</div>;
}

export function AvatarFallback({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
