import { AlertCircle, CheckCircle2 } from 'lucide-react';
import TranslatedText from '../TranslatedText';
import { cn } from '../../lib/utils';

interface InlineStatusProps {
  kind: 'success' | 'error';
  message: string;
  className?: string;
}

const InlineStatus = ({ kind, message, className }: InlineStatusProps) => {
  const isError = kind === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        isError
          ? 'border-error/30 bg-error/5 text-error'
          : 'border-success/30 bg-success/5 text-success',
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <TranslatedText>{message}</TranslatedText>
    </div>
  );
};

export default InlineStatus;
