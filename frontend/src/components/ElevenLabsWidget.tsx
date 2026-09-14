import React, { useMemo } from 'react';
import { useElevenLabsWidget } from '../hooks/useElevenLabsWidget';
import TranslatedText from './TranslatedText';
import Button from './ui/Button';
import StatusState from './ui/StatusState';

export interface WidgetLabels {
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
  const { containerRef, error, status, retry } = useElevenLabsWidget({
    agentId,
    language,
    attributes,
    onWidgetReady,
  });

  return (
    <div className="min-h-[12rem] w-full">
      <div ref={containerRef} className={status === 'ready' ? className : 'hidden'} />
      {status === 'loading' && <StatusState kind="loading" message="Voice Agent Loading..." />}
      {status === 'error' && error && (
        <div className="flex flex-col items-center">
          <StatusState kind="error" message={error} className="min-h-[9rem]" />
          <Button type="button" variant="outline" onClick={retry}>
            <TranslatedText>New conversation</TranslatedText>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ElevenLabsWidget;
