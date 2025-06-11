import React, { createContext, useContext, useState, useEffect } from 'react';
import { lingoTranslationService } from '../services/LingoTranslationService';

interface LingoTranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isTranslating: boolean;
  translateText: (text: string) => Promise<string>;
  preloadingComplete: boolean;
  isInitialized: boolean;
}

const LingoTranslationContext = createContext<LingoTranslationContextType | undefined>(undefined);

export const LingoTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en-US');
  const [isTranslating, setIsTranslating] = useState(false);
  const [preloadingComplete, setPreloadingComplete] = useState(true); // Default to true for English
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the translation context
    const initializeTranslationContext = async () => {
      try {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize translation context:', error);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeTranslationContext();

    // Listen for language change events from LanguageSwitcher
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newLanguage = customEvent.detail.language;
      setLanguage(newLanguage);
      localStorage.setItem('selectedLanguage', newLanguage);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // Preload common translations when language changes
  useEffect(() => {
    if (!isInitialized) return;

    const preloadTranslations = async () => {
      if (language === 'es-ES') {
        setPreloadingComplete(false);
        console.log('🚀 Starting translation preload for Spanish...');
        try {
          // Clear any existing translations to force reload
          lingoTranslationService.clearCache();
          await lingoTranslationService.preloadCommonTranslations(language);
          console.log('✅ Translation preload completed');
          
          // Force a small delay to ensure all components get the updated context
          setTimeout(() => {
            setPreloadingComplete(true);
          }, 100);
        } catch (error) {
          console.error('❌ Translation preload failed:', error);
          setPreloadingComplete(true);
        }
      } else {
        lingoTranslationService.clearCache(); // Clear cache for English too
        setPreloadingComplete(true);
      }
    };

    preloadTranslations();
  }, [language, isInitialized]);

  const translateText = async (text: string): Promise<string> => {
    // Always return something, never undefined
    if (!text || typeof text !== 'string') {
      return '';
    }

    if (language === 'en-US') {
      return text;
    }

    setIsTranslating(true);
    try {
      const translated = await lingoTranslationService.translateText(text, language);
      return translated || text; // Ensure we always return a string
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    } finally {
      setIsTranslating(false);
    }
  };

  // Don't render children until context is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <LingoTranslationContext.Provider value={{ 
      language, 
      setLanguage, 
      isTranslating, 
      translateText,
      preloadingComplete,
      isInitialized
    }}>
      {children}
    </LingoTranslationContext.Provider>
  );
};

export const useLingoTranslation = () => {
  const context = useContext(LingoTranslationContext);
  if (context === undefined) {
    throw new Error('useLingoTranslation must be used within a LingoTranslationProvider');
  }
  return context;
}; 