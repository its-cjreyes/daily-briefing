export interface BriefingSection {
  slug: string;
  label: string;
  headline: string;
  digest: string;
  summary: string;
  full: string;
}

export interface Briefing {
  date: string;
  sections: BriefingSection[];
  generatedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
