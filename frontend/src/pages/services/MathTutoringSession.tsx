import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import { AGENT_IDS, WIDGET_TRANSLATIONS, WIDGET_CONFIG } from '../../config/agentConfig';

// Add window type for ElevenLabs API
declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: any) => void;
    };
  }
}

const MathTutoringSession: React.FC = () => {
  const navigate = useNavigate();
  const [isElevenLabsLoaded, setIsElevenLabsLoaded] = useState(false);
  const { language } = useLingoTranslation();

  // Convert our app's language code to ElevenLabs format and force lowercase
  const widgetLanguage = (language === 'en-US' ? 'en' : 'es').toLowerCase();
  const i18n = WIDGET_TRANSLATIONS[widgetLanguage as keyof typeof WIDGET_TRANSLATIONS];

  // Load widget script
  useEffect(() => {
    if (!document.querySelector(`script[src="${WIDGET_CONFIG.SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = WIDGET_CONFIG.SCRIPT_SRC;
      script.async = true;

      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (customElements.get(WIDGET_CONFIG.ELEMENT_NAME)) {
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
      const widget = document.querySelector(WIDGET_CONFIG.ELEMENT_NAME);
      if (widget) widget.remove();
    };
  }, []);

  // Handle language changes and widget updates
  useEffect(() => {
    if (!isElevenLabsLoaded) return;

    // Remove existing widget
    const existingWidget = document.querySelector(WIDGET_CONFIG.ELEMENT_NAME);
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
      const widget = document.createElement(WIDGET_CONFIG.ELEMENT_NAME);

      // Configure widget
      const config = {
        'agent-id': AGENT_IDS.math,
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
      {/* Header with Back Button and AI Notice */}
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

        {/* AI Notice Icon with Tooltip */}
        <div className="relative group">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <Info className="h-5 w-5" />
          </button>

          {/* Modern Tooltip */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg">
            <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
            <TranslatedText>AI-generated content may contain inaccuracies. Use at your own discretion.</TranslatedText>
          </div>
        </div>
      </div>

      {/* Widget Container */}
      <div className="widget-container" />
    </motion.div>
  );
};

export default MathTutoringSession;
