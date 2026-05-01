import { NextResponse } from 'next/server';
import { listBriefingHistory } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = await listBriefingHistory();
  return NextResponse.json({ entries });
}
