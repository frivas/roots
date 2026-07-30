import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { ArrowLeft } from 'lucide-react';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import ElevenLabsWidget from '../../components/ElevenLabsWidget';
import AiAccuracyNotice from '../../components/AiAccuracyNotice';
import { AGENT_IDS, WIDGET_TRANSLATIONS } from '../../config/agentConfig';
import { APP_ROUTES } from '../../config/routes';

const ParentWellnessChat: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage as keyof typeof WIDGET_TRANSLATIONS];

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Back Button, Title, and AI Notice */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(APP_ROUTES.servicesParentWellness)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Wellness</TranslatedText>
        </Button>

        <h1 className="text-xl font-semibold text-foreground">
          <TranslatedText>Parent Wellness Chat</TranslatedText>
        </h1>

        <AiAccuracyNotice />
      </div>

      {/* Widget Container */}
      <ElevenLabsWidget
        agentId={AGENT_IDS.parentWellness}
        language={widgetLanguage}
        labels={i18n}
      />
    </div>
  );
};

export default ParentWellnessChat;
