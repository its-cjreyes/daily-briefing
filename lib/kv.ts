import { Redis } from '@upstash/redis';
import type { Briefing } from './types';

const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getClient(): Redis {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getBriefing(date: string): Promise<Briefing | null> {
  return getClient().get<Briefing>(`briefing:${date}`);
}

export async function setBriefing(date: string, briefing: Briefing): Promise<void> {
  await getClient().set(`briefing:${date}`, briefing, { ex: TTL_SECONDS });
}
