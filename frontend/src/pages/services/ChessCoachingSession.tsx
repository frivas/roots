import React from 'react';
import { useNavigate } from 'react-router';
import AgentSession from '../../components/AgentSession';
import { AGENT_IDS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';

const ChessCoachingSession: React.FC = () => {
  const navigate = useNavigate();
  return <AgentSession agentId={AGENT_IDS.chess} title="Chess Coaching"
    backLabel="Back to Online Learning"
    onBack={() => navigate(`${APP_ROUTES.servicesExtraCurricular}?tab=online`)} />;
};

export default ChessCoachingSession;
