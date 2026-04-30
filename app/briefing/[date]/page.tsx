import { notFound } from 'next/navigation';
import { getBriefing } from '@/lib/kv';
import BriefingPageClient from '@/components/BriefingPageClient';

interface Props {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ section?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  const briefing = await getBriefing(date);
  if (!briefing) return { title: 'Briefing' };
  return {
    title: `Briefing — ${date}`,
    description: briefing.sections[0]?.digest ?? 'Your morning intelligence briefing.',
  };
}

export default async function BriefingPage({ params, searchParams }: Props) {
  const { date } = await params;
  const { section } = await searchParams;

  const briefing = await getBriefing(date);
  if (!briefing) notFound();

  return <BriefingPageClient briefing={briefing} initialSection={section} />;
}
