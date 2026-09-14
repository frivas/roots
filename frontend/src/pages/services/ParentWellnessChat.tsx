import React from 'react';
import { useNavigate } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const ParentWellnessChat: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLingoTranslation();
  const widgetLanguage = language === 'en-US' ? 'en' : 'es';

  return <AgentSession agentId={AGENT_IDS.parentWellness} language={widgetLanguage}
    labels={WIDGET_TRANSLATIONS[widgetLanguage]} title="Parent Wellness Chat"
    backLabel="Back to Wellness" onBack={() => navigate(APP_ROUTES.servicesParentWellness)} />;
};

export default ParentWellnessChat;
