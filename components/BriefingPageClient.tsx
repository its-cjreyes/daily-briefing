'use client';

import { useState, useEffect } from 'react';
import type { Briefing } from '@/lib/types';
import Masthead from './Masthead';
import BriefingSectionComponent from './BriefingSection';
import ChatSidebar from './ChatSidebar';

interface Props {
  briefing: Briefing;
  initialSection?: string;
}

export default function BriefingPageClient({ briefing, initialSection }: Props) {
  const [activeSectionSlug, setActiveSectionSlug] = useState<string | null>(null);

  // Handle deep-link from email: ?section=slug
  useEffect(() => {
    if (!initialSection) return;

    const section = briefing.sections.find(s => s.slug === initialSection);
    if (!section) return;

    // Small delay to ensure the DOM is ready
    const timeout = setTimeout(() => {
      const el = document.getElementById(initialSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setActiveSectionSlug(initialSection);
    }, 120);

    return () => clearTimeout(timeout);
  }, [initialSection, briefing.sections]);

  const activeSection = briefing.sections.find(s => s.slug === activeSectionSlug) ?? null;
  const chatOpen = activeSectionSlug !== null;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Main content — shrinks on desktop when chat is open */}
      <div
        className={`transition-[margin] duration-300 ease-in-out ${
          chatOpen ? 'lg:mr-[420px]' : ''
        }`}
      >
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Masthead date={briefing.date} />

          <div className="mt-16">
            {briefing.sections.map((section, i) => (
              <div key={section.slug}>
                {i > 0 && (
                  <hr className="border-0 border-t border-border-subtle my-16" />
                )}
                <BriefingSectionComponent
                  section={section}
                  onChat={() => setActiveSectionSlug(section.slug)}
                />
              </div>
            ))}
          </div>

          <footer className="mt-20 pb-8 border-t border-border-subtle pt-8">
            <p className="font-sans text-dim text-xs text-center tracking-wide">
              Generated {new Date(briefing.generatedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZone: 'America/New_York',
              })} ET
            </p>
          </footer>
        </div>
      </div>

      {/* Chat sidebar */}
      {chatOpen && activeSection && (
        <ChatSidebar
          section={activeSection}
          onClose={() => setActiveSectionSlug(null)}
        />
      )}
    </div>
  );
}
