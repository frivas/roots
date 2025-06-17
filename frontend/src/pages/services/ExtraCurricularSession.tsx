import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { ArrowLeft } from 'lucide-react';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const WIDGET_ELEMENT_NAME = 'elevenlabs-convai';
const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

// Static translations for widget UI
const widgetTranslations = {
  en: {
    actionText: 'Click to talk',
    startCall: 'Start Session',
    endCall: 'End Session',
    expand: 'Expand',
    listening: 'Listening...',
    speaking: 'Speaking...'
  },
  es: {
    actionText: 'Haz clic para hablar',
    startCall: 'Iniciar Sesión',
    endCall: 'Finalizar Sesión',
    expand: 'Expandir',
    listening: 'Escuchando...',
    speaking: 'Hablando...'
  }
};

// Agent IDs for different activities
const AGENT_IDS = {
  language: 'agent_01jxy264qbe49b8f3rk71wnzn7',
  chess: 'your_chess_agent_id',
  math: 'your_math_agent_id'
};

// Add window type for ElevenLabs API
declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: any) => void;
    };
  }
}

const ExtraCurricularSession: React.FC = () => {
  const navigate = useNavigate();
  const { activityType } = useParams();
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = widgetTranslations[widgetLanguage];

  useEffect(() => {
    // Only proceed if we don't already have the script loaded
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => setIsWidgetLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsWidgetLoaded(true);
    }

    // Create widget element after a short delay to ensure script is loaded
    const initWidget = () => {
      const container = document.querySelector('.widget-container');
      if (!container) return;

      // Remove any existing widget first
      const existingWidget = document.querySelector(WIDGET_ELEMENT_NAME);
      if (existingWidget) {
        existingWidget.remove();
      }

      // Create new widget
      const widget = document.createElement(WIDGET_ELEMENT_NAME);
      
      // Set the agent ID based on activity type
      if (activityType === 'language') {
        widget.setAttribute('agent-id', AGENT_IDS.language);
      } else if (activityType === 'chess') {
        widget.setAttribute('agent-id', AGENT_IDS.chess);
      } else if (activityType === 'math') {
        widget.setAttribute('agent-id', AGENT_IDS.math);
      }

      container.appendChild(widget);
    };

    // Initialize widget with a delay to ensure script is loaded
    const timeoutId = setTimeout(initWidget, 1000);

    return () => {
      clearTimeout(timeoutId);
      const widget = document.querySelector(WIDGET_ELEMENT_NAME);
      if (widget) widget.remove();
    };
  }, [activityType, isWidgetLoaded]);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/services/extra-curricular')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Activities</TranslatedText>
        </Button>
      </div>

      {/* Widget Container */}
      <div className="widget-container" style={{ minHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {!isWidgetLoaded && (
          <div className="text-center">
            <TranslatedText>Loading activity session...</TranslatedText>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraCurricularSession; 