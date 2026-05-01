'use client';

import { useRef, useEffect, useState } from 'react';
import type { BriefingSection } from '@/lib/types';

const SUGGESTED_PROMPTS: Record<string, string> = {
  geopolitics: "What's the broader historical context behind today's geopolitics story?",
  'canadian-politics': "What are the likely downstream effects of today's Canadian politics developments?",
  'ai-tech': "Break down the technical significance of today's AI & Tech story for a non-engineer.",
  'markets-economy': "What should I know as a retail investor about today's market story?",
  culture: "Why does today's culture story matter beyond the surface level?",
  'deep-dive': "Go even deeper on today's topic — what's the most surprising thing most people don't know about this?",
};

interface Props {
  section: BriefingSection;
  isOpen: boolean;
  onToggle: () => void;
}

export default function BriefingSectionComponent({ section, isOpen, onToggle }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const text = [
      `[${section.label.toUpperCase()}]`,
      section.headline,
      '',
      section.full,
      '',
      `My question: ${SUGGESTED_PROMPTS[section.slug] ?? ''}`,
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      ref={sectionRef}
      id={section.slug}
      className="rounded-[20px] border border-white/[0.12]"
      style={{ background: '#7d8a86', scrollMarginTop: '72px' }}
    >
      {/* ── Collapsed header — always visible, click to toggle ── */}
      <button
        className="w-full text-left cursor-pointer"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${section.slug}-body`}
      >
        <div className="px-8 pt-9 pb-8">
          {/* Section label pill */}
          <span
            className="inline-block mb-5 font-sans"
            style={{
              background: '#C94F3A',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {section.label}
          </span>

          {/* Headline + chevron */}
          <div className="flex items-start gap-5">
            <h2 className={`font-sans text-[1.4rem] md:text-[1.6rem] leading-[1.2] font-bold tracking-[-0.025em] text-ink flex-1 ${isOpen ? '' : 'line-clamp-3'}`}>
              {section.headline}
            </h2>

            {/* Chevron — rotates 180° when open */}
            <div
              className="flex-shrink-0 mt-1 text-muted transition-transform duration-300 ease-in-out"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* ── Expandable body — grid-template-rows trick for smooth animation ── */}
      <div
        id={`${section.slug}-body`}
        role="region"
        aria-labelledby={`${section.slug}-header`}
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="px-8 pb-11">
            {/* Hairline divider between header and body */}
            <hr className="border-0 border-t border-white/[0.2] mb-7" />

            {/* Body copy */}
            <div className="font-sans text-[15px] leading-[1.8] text-white space-y-5">
              {section.full.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Copy & Ask pill CTA */}
            <button
              onClick={handleCopy}
              className="mt-9 inline-flex items-center gap-2 px-5 py-[9px] rounded-full font-sans text-[10px] font-semibold tracking-label uppercase transition-[background-color,color] duration-200 hover:bg-[rgba(201,79,58,0.15)]"
              style={
                copied
                  ? { background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }
                  : { background: '#ffffff', color: '#C94F3A' }
              }
            >
              {copied ? 'COPIED ✓' : 'COPY & ASK →'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
