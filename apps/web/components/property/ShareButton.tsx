'use client';
import { useState } from 'react';
import { Share2 } from 'lucide-react';
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const click = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { /* user cancelled */ }
  };
  return (
    <button onClick={click} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 600, border: '1px solid #111', background: '#fff', color: '#111' }}>
      <Share2 size={14} />{copied ? 'Link copied' : 'Share'}
    </button>
  );
}
