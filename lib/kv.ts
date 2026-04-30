import { kv } from '@vercel/kv';
import type { Briefing } from './types';

const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function getBriefing(date: string): Promise<Briefing | null> {
  return kv.get<Briefing>(`briefing:${date}`);
}

export async function setBriefing(date: string, briefing: Briefing): Promise<void> {
  await kv.set(`briefing:${date}`, briefing, { ex: TTL_SECONDS });
}
