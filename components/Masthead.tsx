interface Props {
  date: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Masthead({ date }: Props) {
  return (
    <header className="flex items-baseline justify-between border-b border-border-subtle pb-8">
      <h1 className="font-serif text-5xl font-normal italic text-ink tracking-tight">
        Briefing
      </h1>
      <p className="font-sans text-sm text-muted tracking-wide">
        {formatDate(date)}
      </p>
    </header>
  );
}
