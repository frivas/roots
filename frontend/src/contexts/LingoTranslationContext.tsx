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
  const [language, setLanguage] = useState<string>(() => {
    // Prioritize auth language selection, then saved language, then default
    const authLanguage = localStorage.getItem('authSelectedLanguage');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    
    console.log(`🔍 Language initialization - Auth: ${authLanguage}, Saved: ${savedLanguage}`);
    
    let initialLang = 'en-US'; // default
    
    if (authLanguage === 'en-US' || authLanguage === 'es-ES') {
      initialLang = authLanguage;
      console.log(`🚀 Context initializing with AUTH language: ${initialLang}`);
      // Clear auth language after using it and set it as the user's preference
      localStorage.removeItem('authSelectedLanguage');
      localStorage.setItem('selectedLanguage', initialLang);
    } else if (savedLanguage === 'en-US' || savedLanguage === 'es-ES') {
      initialLang = savedLanguage;
      console.log(`🚀 Context initializing with SAVED language: ${initialLang}`);
    } else {
      console.log(`🚀 Context initializing with DEFAULT language: ${initialLang}`);
    }
    
    return initialLang;
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [preloadingComplete, setPreloadingComplete] = useState(() => {
    // Initialize based on starting language - Spanish needs preloading, English doesn't
    const authLanguage = localStorage.getItem('authSelectedLanguage');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    
    const currentLang = authLanguage || savedLanguage || 'en-US';
    return currentLang !== 'es-ES'; // false for Spanish, true for English or default
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the translation context
    const initializeTranslationContext = async () => {
      try {
        // Check for auth language one more time after context initialization
        const authLanguage = localStorage.getItem('authSelectedLanguage');
        if (authLanguage === 'en-US' || authLanguage === 'es-ES') {
          console.log(`🔄 Found auth language during initialization: ${authLanguage}`);
          setLanguage(authLanguage);
          localStorage.removeItem('authSelectedLanguage');
          localStorage.setItem('selectedLanguage', authLanguage);
        } else {
          // Language is already set from localStorage in useState initializer
          // Just ensure localStorage has the current value
          localStorage.setItem('selectedLanguage', language);
          console.log(`🔄 Initialized with language: ${language}`);
        }
        
        // Small delay to ensure all initialization is complete
        await new Promise(resolve => setTimeout(resolve, 50));
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize translation context:', error);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeTranslationContext();

    // Listen for language change events from LanguageSwitcher and Settings
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newLanguage = customEvent.detail.language;
      
      if (newLanguage && (newLanguage === 'en-US' || newLanguage === 'es-ES')) {
        console.log(`🌍 Language change event received: ${newLanguage}`);
        setLanguage(newLanguage);
        localStorage.setItem('selectedLanguage', newLanguage);
      } else {
        console.warn('Invalid language code received:', newLanguage);
      }
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

  // Provide setLanguage function that also dispatches events for consistency
  const setLanguageWithEvent = (lang: string) => {
    if (lang && (lang === 'en-US' || lang === 'es-ES')) {
      console.log(`🌍 Manual language change: ${lang}`);
      setLanguage(lang);
      localStorage.setItem('selectedLanguage', lang);
      
      // Dispatch event for any components that might be listening
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: lang }
      }));
    } else {
      console.warn('Invalid language code for setLanguage:', lang);
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
      setLanguage: setLanguageWithEvent, 
      isTranslating, 
      translateText,
      preloadingComplete,
      isInitialized
    }}>
      {children}
    </LingoTranslationContext.Provider>
  );
};

export function useLingoTranslation() {
  const context = useContext(LingoTranslationContext);
  if (context === undefined) {
    throw new Error('useLingoTranslation must be used within a LingoTranslationProvider');
  }
  return context;
}; 