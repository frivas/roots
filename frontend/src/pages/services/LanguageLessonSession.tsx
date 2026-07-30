import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import ElevenLabsWidget from '../../components/ElevenLabsWidget';
import AiAccuracyNotice from '../../components/AiAccuracyNotice';

// Static translations for widget UI
const widgetTranslations = {
  en: {
    actionText: 'Click to talk',
    startCall: 'Start Call',
    endCall: 'End Call',
    expand: 'Expand',
    listening: 'Listening...',
    speaking: 'Speaking...'
  },
  es: {
    actionText: 'Haz clic para hablar',
    startCall: 'Iniciar Llamada',
    endCall: 'Finalizar Llamada',
    expand: 'Expandir',
    listening: 'Escuchando...',
    speaking: 'Hablando...'
  }
};

const LanguageLessonSession: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = widgetTranslations[widgetLanguage as keyof typeof widgetTranslations];

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
          onClick={() => navigate('/services/extra-curricular?tab=online')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Online Learning</TranslatedText>
        </Button>

        <h1 className="text-xl font-semibold text-foreground">
          <TranslatedText>Language Lessons</TranslatedText>
        </h1>

        <AiAccuracyNotice />
      </div>

      {/* Widget Container */}
      <ElevenLabsWidget
        agentId="agent_01jxy264qbe49b8f3rk71wnzn7"
        language={widgetLanguage}
        labels={i18n}
      />
    </motion.div>
  );
};

export default LanguageLessonSession;
