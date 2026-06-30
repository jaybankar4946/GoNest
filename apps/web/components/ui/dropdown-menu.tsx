'use client';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children, align }: { children: React.ReactNode; align?: string }) {
  return (
    <div className="absolute right-0 mt-1 min-w-[140px] bg-white rounded-xl border py-1 z-50"
      style={{ borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
      style={{ fontFamily: 'var(--font-body)', color: '#374151' }}>
      {children}
    </button>
  );
}
