import React from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import TranslatedText from '../TranslatedText';

interface StatusStateProps {
  kind: 'loading' | 'error' | 'empty';
  message: string;
  className?: string;
}

const StatusState: React.FC<StatusStateProps> = ({ kind, message, className = '' }) => {
  const isError = kind === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-busy={kind === 'loading' || undefined}
      className={`flex min-h-[12rem] flex-col items-center justify-center gap-4 text-center ${className}`}
    >
      {kind === 'loading' && (
        <span
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
        />
      )}
      {kind === 'error' && <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />}
      {kind === 'empty' && <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
      <TranslatedText element="p" className={isError ? 'text-destructive' : 'text-muted-foreground'}>
        {message}
      </TranslatedText>
    </div>
  );
};

export default StatusState;
