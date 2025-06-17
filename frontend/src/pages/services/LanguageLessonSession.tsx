import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';

const WIDGET_ELEMENT_NAME = 'elevenlabs-convai';
const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

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

// Add window type for ElevenLabs API
declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: any) => void;
    };
  }
}

const LanguageLessonSession: React.FC = () => {
  const navigate = useNavigate();
  const [isElevenLabsLoaded, setIsElevenLabsLoaded] = useState(false);
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = widgetTranslations[widgetLanguage];

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
      
      // Configure widget
      const config = {
        'agent-id': 'agent_01jxy264qbe49b8f3rk71wnzn7',
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
    }, 100);

  }, [isElevenLabsLoaded, widgetLanguage, i18n]);

  return (
    <motion.div
      className="space-y-8 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/services/extra-curricular?tab=online')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Online Learning</TranslatedText>
        </Button>
      </div>

      {/* Widget Container */}
      <div className="widget-container" />
    </motion.div>
  );
};

export default LanguageLessonSession; 