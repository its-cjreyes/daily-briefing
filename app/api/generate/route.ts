import { NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/anthropic';
import { setBriefing } from '@/lib/kv';
import { sendBriefingEmail } from '@/lib/email';

// Allow up to 5 minutes — needed for multi-step web search + generation
export const maxDuration = 300;

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

    console.log(`[generate] Sending email`);
    await sendBriefingEmail(briefing);

    console.log(`[generate] Done`);
    return NextResponse.json({
      success: true,
      date: today,
      sections: briefing.sections.map(s => s.slug),
    });
  } catch (err) {
    console.error('[generate] Failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate briefing', details: String(err) },
      { status: 500 },
    );
  }
}
