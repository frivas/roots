import React from 'react';
import { useNavigate, useParams } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';

const ExtraCurricularSession: React.FC = () => {
  const navigate = useNavigate();
  const { activityType } = useParams();
  const agentId = activityType ? AGENT_IDS[activityType as keyof typeof AGENT_IDS] : undefined;

  return <AgentSession agentId={agentId} title="Extracurricular Activity"
    backLabel="Back to Online Learning"
    onBack={() => navigate(`${APP_ROUTES.servicesExtraCurricular}?tab=online`)}
    unavailableMessage="This activity is not available." />;
};

export default ExtraCurricularSession;
