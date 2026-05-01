'use client';

import { useRef, useEffect } from 'react';
import type { BriefingSection } from '@/lib/types';

const SUGGESTED_PROMPTS: Record<string, string> = {
  geopolitics: "What's the broader historical context behind today's geopolitics story?",
  'canadian-politics': "What are the likely downstream effects of today's Canadian politics developments?",
  'ai-tech': "Break down the technical significance of today's AI & Tech story for a non-engineer.",
  'markets-economy': "What should I know as a retail investor about today's market story?",
  culture: "Why does today's culture story matter beyond the surface level?",
  'deep-dive': "Go even deeper on today's topic — what's the most surprising thing most people don't know about this?",
};

function buildSummary(full: string): string {
  const firstPara = (full.split('\n\n')[0] ?? '').trim();
  const sentences = firstPara.match(/[^.!?]+[.!?]+/g) ?? [firstPara];
  let summary = '';
  for (const s of sentences.slice(0, 3)) {
    if (summary.length + s.length > 400) break;
    summary += s;
  }
  return summary.trim() || firstPara.slice(0, 400);
}

function buildClaudeUrl(section: BriefingSection): string {
  const label = section.label.toUpperCase();
  const suggestedPrompt = SUGGESTED_PROMPTS[section.slug] ?? '';
  const summary = buildSummary(section.full);
  const prompt = [
    `[${label}] ${section.headline}`,
    '',
    `Summary: ${summary}`,
    '',
    `My question: ${suggestedPrompt}`,
  ].join('\n');
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

interface Props {
  section: BriefingSection;
  isOpen: boolean;
  onToggle: () => void;
}

export default function BriefingSectionComponent({ section, isOpen, onToggle }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
    return () => clearTimeout(timeout);
  }, [isOpen]);

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

            {/* Body copy — full white for contrast against sage cards */}
            <div className="font-sans text-[15px] leading-[1.8] text-white space-y-5">
              {section.full.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Pill CTA — solid white, orange text */}
            <a
              href={buildClaudeUrl(section)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 px-5 py-[9px] rounded-full bg-white text-accent hover:bg-[rgba(201,79,58,0.15)] font-sans text-[10px] font-semibold tracking-label uppercase transition-[background-color] duration-200"
              onClick={e => e.stopPropagation()}
            >
              Ask Claude <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
