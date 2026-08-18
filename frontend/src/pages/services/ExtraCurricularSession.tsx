import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import ElevenLabsWidget from '../../components/ElevenLabsWidget';
import AiAccuracyNotice from '../../components/AiAccuracyNotice';
import { APP_ROUTES } from '../../config/routes';

const ExtraCurricularSession: React.FC = () => {
  const navigate = useNavigate();
  const { activityType } = useParams();
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage as keyof typeof WIDGET_TRANSLATIONS];
  const agentId = activityType
    ? AGENT_IDS[activityType as keyof typeof AGENT_IDS]
    : undefined;

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
          <TranslatedText>Extracurricular Activity</TranslatedText>
        </h1>

        <AiAccuracyNotice />
      </div>

      {/* Widget Container */}
      {agentId ? (
        <ElevenLabsWidget agentId={agentId} language={widgetLanguage} labels={i18n} />
      ) : (
        <p role="alert" className="text-sm text-destructive">
          <TranslatedText>This activity is not available.</TranslatedText>
        </p>
      )}
    </motion.div>
  );
};

export default ExtraCurricularSession;
