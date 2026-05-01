import RegenerateButton from './RegenerateButton';

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
    <header className="flex items-center justify-between border-b border-border-subtle pb-7">
      <h1 className="font-sans text-[1.65rem] font-bold tracking-[-0.03em] text-ink">
        Briefing
      </h1>
      <div className="flex items-center gap-3">
        <RegenerateButton />
        <p className="font-sans text-[11px] font-medium text-muted tracking-label uppercase">
          {formatDate(date)}
        </p>
      </div>
    </header>
  );
}
