import React, { useMemo } from 'react';
import { useElevenLabsWidget } from '../hooks/useElevenLabsWidget';
import TranslatedText from './TranslatedText';

interface WidgetLabels {
  actionText: string;
  startCall: string;
  endCall: string;
  expand: string;
  listening: string;
  speaking: string;
}

interface ElevenLabsWidgetProps {
  agentId: string;
  language: string;
  labels: WidgetLabels;
  onWidgetReady?: (widget: HTMLElement) => void | (() => void);
  className?: string;
}

const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({
  agentId,
  language,
  labels,
  onWidgetReady,
  className = 'widget-container',
}) => {
  const attributes = useMemo(() => ({
    'action-text': labels.actionText,
    'start-call-text': labels.startCall,
    'end-call-text': labels.endCall,
    'expand-text': labels.expand,
    'listening-text': labels.listening,
    'speaking-text': labels.speaking,
    style: 'display: block; margin: 0 auto;',
  }), [labels]);
  const { containerRef, error } = useElevenLabsWidget({
    agentId,
    language,
    attributes,
    onWidgetReady,
  });

  return (
    <>
      <div ref={containerRef} className={className} />
      {error && (
        <p role="alert" aria-live="assertive" className="mt-4 text-sm text-destructive">
          <TranslatedText>{error}</TranslatedText>
        </p>
      )}
    </>
  );
};

export default ElevenLabsWidget;
