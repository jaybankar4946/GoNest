'use client';
import * as React from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type SelectContextType = {
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const SelectContext = React.createContext<SelectContextType>({
  value: '', onValueChange: () => {}, open: false, setOpen: () => {},
});

export function Select({ value, onValueChange, children }: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, style, children }: {
  className?: string; style?: React.CSSProperties; children: React.ReactNode;
}) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button onClick={() => setOpen(!open)}
      className={`flex items-center gap-1 ${className ?? ''}`} style={style}>
      {children}
      <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute left-0 top-full mt-1 min-w-[160px] bg-white rounded-xl border py-1 z-50"
        style={{ borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        {children}
      </div>
    </>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const { onValueChange, setOpen, value: selected } = React.useContext(SelectContext);
  return (
    <button
      onClick={() => { onValueChange(value); setOpen(false); }}
      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
      style={{ fontFamily: 'var(--font-body)', color: '#374151', fontWeight: selected === value ? 600 : 400 }}>
      {children}
    </button>
  );
}
