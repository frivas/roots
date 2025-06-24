import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { ArrowLeft } from 'lucide-react';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const WIDGET_ELEMENT_NAME = 'elevenlabs-convai';
const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

// Static translations for widget UI
const widgetTranslations = {
  en: {
    actionText: 'Click to discuss progress',
    startCall: 'Start Progress Review',
    endCall: 'End Session',
    expand: 'Expand',
    listening: 'Listening...',
    speaking: 'Analyzing...'
  },
  es: {
    actionText: 'Haz clic para discutir progreso',
    startCall: 'Iniciar Revisión de Progreso',
    endCall: 'Finalizar Sesión',
    expand: 'Expandir',
    listening: 'Escuchando...',
    speaking: 'Analizando...'
  }
};



const ProgressInterpretationChat: React.FC = () => {
  const navigate = useNavigate();
  const [isElevenLabsLoaded, setIsElevenLabsLoaded] = useState(false);
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format
  const widgetLanguage = language === 'en-US' ? 'en' : 'es';
  const i18n = widgetTranslations[widgetLanguage];

  console.log('🌐 Current language configuration:', { widgetLanguage, translations: i18n });

  // Load widget script
  useEffect(() => {
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;

      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (customElements.get(WIDGET_ELEMENT_NAME)) {
            clearInterval(checkInterval);
            setIsElevenLabsLoaded(true);
          }
        }, 100);
      };

      document.head.appendChild(script);
    } else {
      setIsElevenLabsLoaded(true);
    }

    return () => {
      const widget = document.querySelector(WIDGET_ELEMENT_NAME);
      if (widget) widget.remove();
    };
  }, []);

  // Handle language changes and widget updates
  useEffect(() => {
    if (!isElevenLabsLoaded) return;

    // Remove existing widget
    const existingWidget = document.querySelector(WIDGET_ELEMENT_NAME);
    if (existingWidget) {
      existingWidget.remove();
    }

    // Initialize ElevenLabs with language config first
    const elevenLabs = window.ElevenLabs;
    if (typeof elevenLabs?.init === 'function') {
      elevenLabs.init({
        language: widgetLanguage,
        defaultLanguage: widgetLanguage
      });
    }

    // Wait a brief moment before creating the new widget
    setTimeout(() => {
      const container = document.querySelector('.widget-container');
      if (!container) return;

      // Create new widget with language configuration
      const widget = document.createElement(WIDGET_ELEMENT_NAME);

      // Configure widget with Progress Interpretation agent
      const config = {
        'agent-id': 'agent_01jydqtbt4e5prhwvrjd9m24bp',
        'language': widgetLanguage,
        'default-language': widgetLanguage,
        'action-text': i18n.actionText,
        'start-call-text': i18n.startCall,
        'end-call-text': i18n.endCall,
        'expand-text': i18n.expand,
        'listening-text': i18n.listening,
        'speaking-text': i18n.speaking,
        'style': 'display: block; margin: 0 auto;'
      };

      // Apply all attributes
      Object.entries(config).forEach(([key, value]) => {
        widget.setAttribute(key, value);
      });

      // Add to DOM
      container.appendChild(widget);
      console.log('🔄 Progress Interpretation widget initialized with language:', widgetLanguage, 'and config:', config);
    }, 100);

  }, [isElevenLabsLoaded, widgetLanguage, i18n]);

  return (
    <div className="space-y-8 pb-8">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/services/progress-interpretation')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Progress Service</TranslatedText>
        </Button>
      </div>

      {/* Widget Container */}
      <div className="widget-container" />
    </div>
  );
};

export default ProgressInterpretationChat;
