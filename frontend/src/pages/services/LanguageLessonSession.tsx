import React from 'react';
import { useNavigate } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const LanguageLessonSession: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLingoTranslation();
  const widgetLanguage = language === 'en-US' ? 'en' : 'es';

  return <AgentSession agentId={AGENT_IDS.language} language={widgetLanguage}
    labels={WIDGET_TRANSLATIONS[widgetLanguage]} title="Language Lessons"
    backLabel="Back to Online Learning"
    onBack={() => navigate(`${APP_ROUTES.servicesExtraCurricular}?tab=online`)} />;
};

export default LanguageLessonSession;
