'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { BriefingSection, ChatMessage } from '@/lib/types';

const SUGGESTED_PROMPTS: Record<string, string> = {
  geopolitics: "What's the broader historical context behind today's geopolitics story?",
  'canadian-politics':
    "What are the likely downstream effects of today's Canadian politics developments?",
  'ai-tech':
    "Break down the technical significance of today's AI & Tech story for a non-engineer.",
  'markets-economy':
    "What should I know as a retail investor about today's market story?",
  culture: "Why does today's culture story matter beyond the surface level?",
  'deep-dive':
    "Go even deeper on today's topic — what's the most surprising thing most people don't know about this?",
};

interface Props {
  section: BriefingSection;
  onClose: () => void;
}

export default function ChatSidebar({ section, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(SUGGESTED_PROMPTS[section.slug] ?? '');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset conversation when the active section changes
  useEffect(() => {
    setMessages([]);
    setInput(SUGGESTED_PROMPTS[section.slug] ?? '');
    textareaRef.current?.focus();
  }, [section.slug]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: content.trim() };
    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, { role: 'assistant', content: '' }]);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          sectionContent: section.full,
          sectionLabel: section.label,
          sectionHeadline: section.headline,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel — bottom sheet on mobile, right rail on desktop */}
      <aside
        className="
          fixed bottom-0 left-0 right-0 z-50
          h-[78vh] rounded-t-2xl
          lg:top-0 lg:right-0 lg:left-auto lg:bottom-0
          lg:h-full lg:w-[420px] lg:rounded-none
          bg-surface border-t border-border-subtle
          lg:border-t-0 lg:border-l lg:border-border-subtle
          flex flex-col
          shadow-[0_-8px_40px_rgba(0,0,0,0.6)] lg:shadow-[-8px_0_40px_rgba(0,0,0,0.5)]
        "
        role="dialog"
        aria-label={`Chat about ${section.label}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-border-subtle flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="font-sans text-accent text-[10px] tracking-widest-plus uppercase mb-1">
              {section.label}
            </p>
            <p className="font-serif text-[13px] text-ink leading-snug line-clamp-2">
              {section.headline}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-muted hover:text-ink transition-colors mt-0.5"
            aria-label="Close chat"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages flex-1 overflow-y-auto p-5 space-y-5">
          {messages.length === 0 && (
            <p className="font-sans text-dim text-sm italic leading-relaxed">
              The suggested prompt is pre-loaded below — edit it or send as-is.
            </p>
          )}

          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const isLoading =
              isStreaming && isLast && msg.role === 'assistant' && msg.content === '';

            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="bg-surface-2 text-ink font-sans text-sm px-4 py-3 rounded-xl max-w-[85%] leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className="font-sans text-[#b8b4ad] text-sm leading-relaxed">
                {isLoading ? (
                  <div className="flex gap-1.5 py-1 items-center">
                    <span
                      className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                      style={{ animationDelay: '160ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                      style={{ animationDelay: '320ms' }}
                    />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border-subtle flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask a question…"
              rows={2}
              className="
                flex-1 bg-surface-2 text-ink font-sans text-sm
                px-4 py-3 rounded-xl
                border border-border-subtle
                focus:outline-none focus:border-[rgba(201,169,110,0.4)]
                resize-none placeholder:text-dim
                transition-colors leading-relaxed
              "
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="
                bg-accent text-canvas font-sans text-sm font-medium
                px-4 py-3 rounded-xl
                hover:bg-accent-bright
                disabled:opacity-35 disabled:cursor-not-allowed
                transition-colors flex-shrink-0 self-end
              "
            >
              Send
            </button>
          </div>
          <p className="font-sans text-dim text-[11px] mt-2">
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </aside>
    </>
  );
}
