import React from 'react';
import { useNavigate, useParams } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const ExtraCurricularSession: React.FC = () => {
  const navigate = useNavigate();
  const { activityType } = useParams();
  const { language } = useLingoTranslation();
  const widgetLanguage = language === 'en-US' ? 'en' : 'es';
  const agentId = activityType ? AGENT_IDS[activityType as keyof typeof AGENT_IDS] : undefined;

  return <AgentSession agentId={agentId} language={widgetLanguage}
    labels={WIDGET_TRANSLATIONS[widgetLanguage]} title="Extracurricular Activity"
    backLabel="Back to Online Learning"
    onBack={() => navigate(`${APP_ROUTES.servicesExtraCurricular}?tab=online`)}
    unavailableMessage="This activity is not available." />;
};

export default ExtraCurricularSession;
