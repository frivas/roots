import { FlaskConical } from 'lucide-react';
import TranslatedText from './TranslatedText';

const DemoModeNotice = () => (
  <aside
    role="status"
    className="flex items-start gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm text-foreground"
  >
    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
    <p>
      <strong><TranslatedText>Demo Mode:</TranslatedText></strong>{' '}
      <TranslatedText>Sample school records are for demonstration only. Changes are not saved.</TranslatedText>
    </p>
  </aside>
);

export default DemoModeNotice;
