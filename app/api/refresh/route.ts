import { NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/anthropic';
import { setBriefing } from '@/lib/kv';

export const maxDuration = 300;

export async function POST() {
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/New_York',
  });

  try {
    const briefing = await generateBriefing(today);
    await setBriefing(today, briefing);
    return NextResponse.json({ success: true, date: today });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
