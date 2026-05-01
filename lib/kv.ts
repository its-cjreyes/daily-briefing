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

export interface HistoryEntry {
  date: string;
  headline: string;
}

export async function listBriefingHistory(): Promise<HistoryEntry[]> {
  const client = getClient();
  const keys: string[] = [];
  let cursor = 0;

  do {
    const [next, found] = await client.scan(cursor, { match: 'briefing:*', count: 100 });
    keys.push(...found);
    cursor = Number(next);
  } while (cursor !== 0);

  if (keys.length === 0) return [];

  const values = await client.mget<(Briefing | null)[]>(...(keys as [string, ...string[]]));

  return (values as (Briefing | null)[])
    .filter((b): b is Briefing => b !== null)
    .map((b: Briefing) => ({
      date: b.date,
      headline: b.sections.find((s: { slug: string }) => s.slug === 'geopolitics')?.headline ?? '',
    }))
    .sort((a: HistoryEntry, b: HistoryEntry) => b.date.localeCompare(a.date));
}

export async function cleanupOldBriefings(): Promise<number> {
  const client = getClient();
  const keys: string[] = [];
  let cursor = 0;

  do {
    const [next, found] = await client.scan(cursor, { match: 'briefing:*', count: 100 });
    keys.push(...found);
    cursor = Number(next);
  } while (cursor !== 0);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffDate = cutoff.toISOString().split('T')[0]; // YYYY-MM-DD

  const oldKeys = keys.filter(key => {
    const date = key.replace('briefing:', '');
    return date < cutoffDate;
  });

  if (oldKeys.length === 0) return 0;

  await Promise.all(oldKeys.map(key => client.del(key)));
  return oldKeys.length;
}
