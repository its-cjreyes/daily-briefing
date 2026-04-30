import { redirect } from 'next/navigation';

export default function Home() {
  // Use ET so the date matches the cron job schedule (7 AM ET = 12:00 UTC)
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/New_York',
  });
  redirect(`/briefing/${today}`);
}
