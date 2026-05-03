'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'idle' | 'loading' | 'error' | 'updated';

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

function todayKey(): string {
  return `lastRefreshed:${new Date().toLocaleDateString('en-CA')}`;
}

export default function RegenerateButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [updatedTime, setUpdatedTime] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(todayKey());
    if (stored) {
      setUpdatedTime(stored);
      setStatus('updated');
    }
  }, []);

  async function handleClick() {
    if (status === 'loading') return;
    setStatus('loading');

    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem(todayKey(), time);
      setUpdatedTime(time);
      setStatus('updated');
      router.refresh(); // re-runs server components in place; client state is preserved
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(updatedTime ? 'updated' : 'idle'), 3000);
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
      {status === 'updated' ? `↻ Updated ${updatedTime}` : '↻ Refresh'}
    </button>
  );
}
