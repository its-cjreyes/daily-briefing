import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-5xl italic text-ink mb-4">Briefing</h1>
        <p className="font-sans text-muted text-base mb-8">
          No briefing has been generated for this date yet.
        </p>
        <Link
          href="/"
          className="font-sans text-sm text-accent hover:text-accent-bright transition-colors tracking-wide"
        >
          ← Back to today
        </Link>
      </div>
    </div>
  );
}
