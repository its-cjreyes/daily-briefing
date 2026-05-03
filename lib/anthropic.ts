import Anthropic from '@anthropic-ai/sdk';
import type { Briefing, BriefingSection } from './types';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_ITERATIONS = 12;

const SYSTEM_PROMPT = `You are a senior editor at a world-class daily intelligence briefing. Your writing is incisive, analytically rigorous, and a cut above standard news summaries — the kind a smart, curious person reads every morning to feel genuinely informed.

Search the web to find today's most important and newsworthy stories in each of these six categories. Choose stories that are genuinely significant, not just trending.

Return your response as a valid JSON object ONLY — no markdown, no code blocks, no preamble or explanation outside the JSON itself. Use this exact structure:

{
  "sections": [
    {
      "slug": "geopolitics",
      "label": "Geopolitics",
      "headline": "A specific, compelling headline",
      "digest": "One sentence capturing what happened and why it matters.",
      "summary": "2-3 sentences providing enough context for a reader to ask an informed follow-up question. Cover the key facts, why this matters, and what's at stake.",
      "full": "First paragraph.\\n\\nSecond paragraph.\\n\\nThird paragraph.\\n\\nFourth paragraph (optional).\\n\\nFifth paragraph (optional)."
    },
    {
      "slug": "canadian-politics",
      "label": "Canadian Politics",
      "headline": "...",
      "digest": "...",
      "summary": "...",
      "full": "..."
    },
    {
      "slug": "ai-tech",
      "label": "AI & Tech",
      "headline": "...",
      "digest": "...",
      "summary": "...",
      "full": "..."
    },
    {
      "slug": "markets-economy",
      "label": "Markets & Economy",
      "headline": "...",
      "digest": "...",
      "summary": "...",
      "full": "..."
    },
    {
      "slug": "culture",
      "label": "Culture",
      "headline": "...",
      "digest": "...",
      "summary": "...",
      "full": "..."
    },
    {
      "slug": "deep-dive",
      "label": "One Thing Worth Understanding",
      "headline": "...",
      "digest": "...",
      "summary": "...",
      "full": "..."
    }
  ]
}

For each "digest" field: one sentence, what happened and why it matters.
For each "summary" field: 2-3 sentences of context — enough for a reader to ask an informed follow-up question. Cover the key facts, stakes, and what to watch.
For each "full" field: write 3–5 substantial paragraphs separated by \\n\\n. Go beyond surface facts — provide historical context, the key players and their motivations, what's at stake, and what to watch for. Aim for the kind of clarity that makes a smart non-expert feel they truly understand the story.`;

function makeClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    defaultHeaders: {
      'anthropic-beta': 'web-search-2025-03-05',
    },
  });
}

export async function generateBriefing(date: string): Promise<Briefing> {
  const client = makeClient();

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Today is ${date}. Search the web for today's top stories and generate the morning briefing as a JSON object.`,
    },
  ];

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // Cache the system prompt — it's identical every day
          cache_control: { type: 'ephemeral' },
        } as Anthropic.TextBlockParam & { cache_control: { type: 'ephemeral' } },
      ],
      messages,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as unknown as Anthropic.Tool,
      ],
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('');

      return parseBriefingJson(text, date);
    }

    if (response.stop_reason === 'tool_use') {
      // Acknowledge each tool call so the loop can continue.
      // The web_search tool results are provided by Anthropic's infrastructure;
      // passing an empty content here signals completion of the round.
      const toolResults: Anthropic.ToolResultBlockParam[] = response.content
        .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
        .map(b => ({
          type: 'tool_result' as const,
          tool_use_id: b.id,
          content: (b as unknown as { output?: string }).output ?? '',
        }));

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // max_tokens or other stop — extract whatever text we have
    const fallbackText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    if (fallbackText) return parseBriefingJson(fallbackText, date);

    throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
  }

  throw new Error('Exceeded max iterations without a final response');
}

const FALLBACK_LABELS: Record<string, string> = {
  'geopolitics': 'Geopolitics',
  'canadian-politics': 'Canadian Politics',
  'ai-tech': 'AI & Tech',
  'markets-economy': 'Markets & Economy',
  'culture': 'Culture',
  'deep-dive': 'One Thing Worth Understanding',
};

function parseBriefingJson(text: string, date: string): Briefing {
  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON object found in model response');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(jsonMatch[0]) as { sections: any[] };

  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Parsed JSON is missing sections array');
  }

  // Log raw keys from the first section so we can inspect model output in Vercel logs
  console.log('[parse] first section keys:', Object.keys(parsed.sections[0]));
  console.log('[parse] first section sample:', JSON.stringify(parsed.sections[0]).slice(0, 300));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: BriefingSection[] = parsed.sections.map((s: any, i: number) => {
    const slug: string =
      (s.slug || s.id || s.section_id || String(i));
    // Use || (not ??) so empty strings also fall through to the fallback
    const rawLabel = s.label || s.name || s.title || s.category || s.section_name || s.section_label;
    const label: string =
      (rawLabel && String(rawLabel).trim()) || FALLBACK_LABELS[slug] || slug;
    return {
      slug,
      label,
      headline: s.headline || s.title_headline || s.heading || '',
      digest: s.digest || s.summary_short || s.brief || '',
      summary: s.summary || s.context || s.overview || '',
      full: s.full || s.full_text || s.body || s.content || '',
    };
  });

  return {
    date,
    sections,
    generatedAt: new Date().toISOString(),
  };
}
