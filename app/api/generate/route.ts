import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateBriefing } from '@/lib/anthropic';
import { setBriefing } from '@/lib/kv';
import { sendBriefingEmail, sendFailureEmail } from '@/lib/email';

// Allow up to 5 minutes — needed for multi-step web search + generation
export const maxDuration = 300;

interface ErrorInfo {
  type: string;
  detail: string;
  isBillingRelated: boolean;
}

function categorizeError(err: unknown): ErrorInfo {
  if (err instanceof Anthropic.APIError) {
    const msg = err.message ?? '';

    // 402 or messages containing credit/balance/billing language
    const isBillingRelated =
      err.status === 402 ||
      /credit|balance|billing|insufficient|quota/i.test(msg);

    if (isBillingRelated) {
      return {
        type: 'Insufficient API credits',
        detail: msg || 'Your Anthropic account may be out of credits.',
        isBillingRelated: true,
      };
    }

    if (err.status === 429) {
      return {
        type: 'Rate limit exceeded',
        detail: msg || 'Too many requests to the Anthropic API.',
        isBillingRelated: false,
      };
    }

    if (err.status === 401 || err.status === 403) {
      return {
        type: `Authentication error (${err.status})`,
        detail: 'The ANTHROPIC_API_KEY may be invalid or revoked.',
        isBillingRelated: false,
      };
    }

    return {
      type: `Anthropic API error (HTTP ${err.status})`,
      detail: msg || 'An unexpected API error occurred.',
      isBillingRelated: false,
    };
  }

  if (err instanceof SyntaxError) {
    return {
      type: 'JSON parse error',
      detail: 'Claude returned a response that could not be parsed as JSON.',
      isBillingRelated: false,
    };
  }

  return {
    type: 'Unexpected error',
    detail: String(err),
    isBillingRelated: false,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const authHeader = req.headers.get('Authorization');
  const querySecret = url.searchParams.get('secret');

  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && querySecret === cronSecret);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/New_York',
  });

  try {
    console.log(`[generate] Starting briefing for ${today}`);
    const briefing = await generateBriefing(today);

    console.log(`[generate] Storing briefing in KV`);
    await setBriefing(today, briefing);

    // Only send the briefing email after confirmed successful generation
    console.log(`[generate] Sending briefing email`);
    await sendBriefingEmail(briefing);

    console.log(`[generate] Done`);
    return NextResponse.json({
      success: true,
      date: today,
      sections: briefing.sections.map(s => s.slug),
    });
  } catch (err) {
    const { type, detail, isBillingRelated } = categorizeError(err);

    console.error(`[generate] Failed — ${type}: ${detail}`, err);

    // Send failure alert — wrapped so a broken email config doesn't swallow the real error
    try {
      await sendFailureEmail(today, type, detail, isBillingRelated);
      console.log(`[generate] Failure alert sent`);
    } catch (emailErr) {
      console.error('[generate] Could not send failure alert email:', emailErr);
    }

    return NextResponse.json(
      { error: type, detail, isBillingRelated },
      { status: 500 },
    );
  }
}
