import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AiAccuracyNotice from './AiAccuracyNotice';
import ElevenLabsWidget, { type WidgetLabels } from './ElevenLabsWidget';
import TranslatedText from './TranslatedText';
import Button from './ui/Button';
import StatusState from './ui/StatusState';

interface AgentSessionProps {
  agentId?: string;
  language: string;
  labels: WidgetLabels;
  title: string;
  backLabel: string;
  onBack: () => void;
  beforeWidget?: React.ReactNode;
  children?: React.ReactNode;
  onWidgetReady?: (widget: HTMLElement) => void | (() => void);
  widgetClassName?: string;
  className?: string;
  unavailableMessage?: string;
}

const AgentSession: React.FC<AgentSessionProps> = ({
  agentId,
  language,
  labels,
  title,
  backLabel,
  onBack,
  beforeWidget,
  children,
  onWidgetReady,
  widgetClassName,
  className = '',
  unavailableMessage = 'An error occurred',
}) => (
  <motion.section
    className={`space-y-6 pb-8 sm:space-y-8 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <header className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="flex w-fit items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <TranslatedText>{backLabel}</TranslatedText>
      </Button>

      <h1 className="text-xl font-semibold text-foreground sm:text-center">
        <TranslatedText>{title}</TranslatedText>
      </h1>

      <div className="self-start sm:justify-self-end">
        <AiAccuracyNotice />
      </div>
    </header>

    {beforeWidget}
    {agentId ? (
      <ElevenLabsWidget
        agentId={agentId}
        language={language}
        labels={labels}
        onWidgetReady={onWidgetReady}
        className={widgetClassName}
      />
    ) : (
      <StatusState kind="error" message={unavailableMessage} />
    )}
    {children}
  </motion.section>
);

export default AgentSession;
