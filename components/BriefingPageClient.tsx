'use client';

import { useState, useEffect } from 'react';
import type { Briefing } from '@/lib/types';
import Masthead from './Masthead';
import BriefingSectionComponent from './BriefingSection';
import RegenerateButton from './RegenerateButton';

const FONT_STACK = `'DM Sans', ui-sans-serif, system-ui, sans-serif`;

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  briefing: Briefing;
  initialSection?: string;
}

export default function BriefingPageClient({ briefing, initialSection }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(initialSection ?? null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyHeader(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleToggle(slug: string) {
    setOpenSlug(prev => prev === slug ? null : slug);
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 30% 20%, #8a9490 0%, #5a6b65 60%, #4a5c56 100%)' }}>

      {/* ── Sticky frosted glass header ── */}
      <header
        aria-hidden={!showStickyHeader}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(90, 107, 101, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transform: showStickyHeader ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <span style={{ fontFamily: FONT_STACK, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.03em', color: '#f0ede6' }}>
          Briefing
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RegenerateButton />
          <span style={{ fontFamily: FONT_STACK, fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            {formatDate(briefing.date)}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-10">
        <Masthead date={briefing.date} />
      </div>

      <div className="max-w-2xl mx-auto px-3 pb-6">
        {briefing.sections.map((section) => (
          <div key={section.slug} style={{ marginBottom: '12px' }}>
            <BriefingSectionComponent
              section={section}
              isOpen={openSlug === section.slug}
              onToggle={() => handleToggle(section.slug)}
            />
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6">
        <footer className="py-10 border-t border-border-subtle">
          <p className="font-sans text-[10px] font-medium tracking-label uppercase text-dim text-center">
            Generated{' '}
            {new Date(briefing.generatedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/New_York',
            })}{' '}
            ET
          </p>
        </footer>
      </div>

    </div>
  );
}
