import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import ElevenLabsWidget from '../../components/ElevenLabsWidget';
import AiAccuracyNotice from '../../components/AiAccuracyNotice';
import { APP_ROUTES } from '../../config/routes';

// Add window type for ElevenLabs API
const ChessCoachingSession: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage as keyof typeof WIDGET_TRANSLATIONS];

  return (
    <motion.div
      className="space-y-8 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with Back Button, Title, and AI Notice */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`${APP_ROUTES.servicesExtraCurricular}?tab=online`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Online Learning</TranslatedText>
        </Button>

        <h1 className="text-xl font-semibold text-foreground">
          <TranslatedText>Chess Coaching</TranslatedText>
        </h1>

        <AiAccuracyNotice />
      </div>

      {/* Widget Container */}
      <ElevenLabsWidget agentId={AGENT_IDS.chess} language={widgetLanguage} labels={i18n} />
    </motion.div>
  );
};

export default ChessCoachingSession;
