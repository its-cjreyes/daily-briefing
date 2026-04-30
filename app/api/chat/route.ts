import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from '@/lib/types';

export const maxDuration = 60;

interface ChatRequest {
  messages: ChatMessage[];
  sectionContent: string;
  sectionLabel: string;
  sectionHeadline: string;
}

export async function POST(req: Request) {
  const { messages, sectionContent, sectionLabel, sectionHeadline } =
    (await req.json()) as ChatRequest;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const systemPrompt = `You are an insightful analyst helping a reader go deeper on their morning briefing. The reader is exploring the "${sectionLabel}" section.

Here is the full briefing content for this section:

**${sectionHeadline}**

${sectionContent}

Engage thoughtfully with their questions. Be analytical, direct, and illuminating. Draw on broader context beyond what's in the briefing when it's genuinely relevant. Keep answers focused — a well-placed paragraph beats an exhaustive essay.`;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      } as Anthropic.TextBlockParam & { cache_control: { type: 'ephemeral' } },
    ],
    messages: messages as Anthropic.MessageParam[],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
