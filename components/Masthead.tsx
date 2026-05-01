'use client';

import { useState, useEffect, useRef } from 'react';
import RegenerateButton from './RegenerateButton';
import type { HistoryEntry } from '@/lib/kv';

const FONT_STACK = `'DM Sans', ui-sans-serif, system-ui, sans-serif`;

const PILL: React.CSSProperties = {
  borderRadius: '999px',
  padding: '5px 14px',
  fontSize: '12px',
  border: '1px solid rgba(255,255,255,0.2)',
  fontFamily: FONT_STACK,
  fontWeight: 500,
  lineHeight: 1,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.8)',
  whiteSpace: 'nowrap' as const,
  transition: 'background 0.2s ease',
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatHistoryDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  date: string;
}

export default function Masthead({ date }: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!historyOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [historyOpen]);

  async function toggleHistory() {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(true);
    if (entries === null) {
      setLoadingHistory(true);
      try {
        const res = await fetch('/api/history');
        const data = await res.json() as { entries: HistoryEntry[] };
        setEntries(data.entries);
      } catch {
        setEntries([]);
      } finally {
        setLoadingHistory(false);
      }
    }
  }

  const showEmptyState = entries !== null && entries.length < 2;

  return (
    <div ref={wrapperRef}>
      <header className="border-b border-border-subtle pb-7">
        {/* Row 1: wordmark + date */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-sans text-[1.65rem] font-bold tracking-[-0.03em] text-ink">
            Briefing
          </h1>
          <p className="font-sans text-[11px] font-medium text-muted tracking-label uppercase">
            {formatDate(date)}
          </p>
        </div>

        {/* Row 2: pill buttons */}
        <div className="flex items-center gap-3">
          <RegenerateButton />
          <button
            style={PILL}
            onClick={toggleHistory}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            ◷ History
          </button>
        </div>
      </header>

      {/* History panel — slides down below masthead border */}
      <div
        style={{
          maxHeight: historyOpen ? '480px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          style={{
            marginTop: '12px',
            background: 'rgba(90, 107, 101, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          {loadingHistory && (
            <p
              style={{
                margin: 0,
                padding: '20px',
                fontFamily: FONT_STACK,
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
              }}
            >
              Loading...
            </p>
          )}

          {!loadingHistory && showEmptyState && (
            <p
              style={{
                margin: 0,
                padding: '24px 20px',
                fontFamily: FONT_STACK,
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
              }}
            >
              No previous briefings yet — check back tomorrow
            </p>
          )}

          {!loadingHistory && entries && entries.length >= 2 && (
            <div>
              {entries.map((entry, i) => (
                <a
                  key={entry.date}
                  href={`/briefing/${entry.date}`}
                  onClick={() => setHistoryOpen(false)}
                  style={{
                    display: 'block',
                    padding: '14px 20px',
                    textDecoration: 'none',
                    background: entry.date === date ? 'rgba(255,255,255,0.1)' : 'transparent',
                    borderBottom:
                      i < entries.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (entry.date !== date)
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      entry.date === date ? 'rgba(255,255,255,0.1)' : 'transparent';
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT_STACK,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)',
                      marginBottom: '3px',
                    }}
                  >
                    {formatHistoryDate(entry.date)}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_STACK,
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.5)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.headline}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
