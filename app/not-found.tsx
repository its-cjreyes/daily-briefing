import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-sans text-[1.65rem] font-bold tracking-[-0.03em] text-ink mb-3">
          Briefing
        </h1>
        <p className="font-sans text-[15px] text-muted mb-8">
          No briefing has been generated for this date yet.
        </p>
        <Link
          href="/"
          className="font-sans text-[11px] font-semibold tracking-label uppercase text-accent hover:text-accent-hover transition-colors"
        >
          ← Back to today
        </Link>
      </div>
    </div>
  );
}
