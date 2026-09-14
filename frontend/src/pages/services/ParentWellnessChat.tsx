import React from 'react';
import { useNavigate } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';

const ParentWellnessChat: React.FC = () => {
  const navigate = useNavigate();
  return <AgentSession agentId={AGENT_IDS.parentWellness} title="Parent Wellness Chat"
    backLabel="Back to Wellness" onBack={() => navigate(APP_ROUTES.servicesParentWellness)} />;
};

export default ParentWellnessChat;
