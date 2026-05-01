import { NextResponse } from 'next/server';
import { cleanupOldBriefings } from '@/lib/kv';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = await cleanupOldBriefings();
  console.log(`[cleanup] Deleted ${deleted} old briefing(s)`);
  return NextResponse.json({ deleted });
}
