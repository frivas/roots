import React from 'react';
import { useNavigate } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';

const ProgressInterpretationChat: React.FC = () => {
  const navigate = useNavigate();
  return <AgentSession agentId={AGENT_IDS.progressInterpretation} title="Progress Review"
    backLabel="Back to Progress Service"
    onBack={() => navigate(APP_ROUTES.servicesProgressInterpretation)} />;
};

export default ProgressInterpretationChat;
