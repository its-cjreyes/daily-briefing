'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'error';

const BASE: React.CSSProperties = {
  borderRadius: '999px',
  padding: '5px 14px',
  fontSize: '12px',
  border: '1px solid rgba(255,255,255,0.2)',
  fontFamily: 'inherit',
  fontWeight: 500,
  lineHeight: 1,
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  whiteSpace: 'nowrap' as const,
};

export default function RegenerateButton() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleClick() {
    if (status !== 'idle') return;
    setStatus('loading');

    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      window.location.reload();
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  if (status === 'error') {
    return (
      <button
        disabled
        style={{
          ...BASE,
          background: 'rgba(201,79,58,0.15)',
          color: 'rgba(255,120,100,0.9)',
          borderColor: 'rgba(201,79,58,0.35)',
          cursor: 'default',
        }}
      >
        Failed — try again
      </button>
    );
  }

  if (status === 'loading') {
    return (
      <button
        disabled
        style={{
          ...BASE,
          background: 'rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.45)',
          cursor: 'not-allowed',
        }}
      >
        <span className="spin" aria-hidden="true">↻</span>{' '}Updating...
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        ...BASE,
        background: 'rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.8)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
    >
      ↻ Refresh
    </button>
  );
}
