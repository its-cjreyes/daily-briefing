import type { BriefingSection } from '@/lib/types';

interface Props {
  section: BriefingSection;
  onChat: () => void;
}

export default function BriefingSectionComponent({ section, onChat }: Props) {
  return (
    <section id={section.slug} className="scroll-mt-16">
      <p className="font-sans text-accent text-[11px] tracking-widest-plus uppercase mb-4">
        {section.label}
      </p>

      <h2 className="font-serif text-[2rem] leading-tight font-normal text-ink mb-6">
        {section.headline}
      </h2>

      <div className="font-sans text-[#b8b4ad] text-[15px] leading-[1.75] space-y-5">
        {section.full.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <button
        onClick={onChat}
        className="mt-8 font-sans text-[13px] text-accent hover:text-accent-bright tracking-wide transition-colors duration-150"
      >
        Chat about this →
      </button>
    </section>
  );
}
