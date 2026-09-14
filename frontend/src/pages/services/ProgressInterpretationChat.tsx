import React from 'react';
import { useNavigate } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const ProgressInterpretationChat: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLingoTranslation();
  const widgetLanguage = language === 'en-US' ? 'en' : 'es';

  return <AgentSession agentId={AGENT_IDS.progressInterpretation} language={widgetLanguage}
    labels={WIDGET_TRANSLATIONS[widgetLanguage]} title="Progress Review"
    backLabel="Back to Progress Service"
    onBack={() => navigate(APP_ROUTES.servicesProgressInterpretation)} />;
};

export default ProgressInterpretationChat;
