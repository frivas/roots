import React from 'react';
import { Info } from 'lucide-react';
import TranslatedText from './TranslatedText';

const AiAccuracyNotice: React.FC = () => (
  <aside
    role="note"
    aria-label="AI accuracy notice"
    className="flex max-w-sm items-start gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground"
  >
    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
    <TranslatedText>
      AI-generated content may contain inaccuracies. Use at your own discretion.
    </TranslatedText>
  </aside>
);

export default AiAccuracyNotice;
