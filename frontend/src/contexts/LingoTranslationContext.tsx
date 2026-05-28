import React, { createContext, useContext, useState, useEffect } from 'react';
import { lingoTranslationService } from '../services/LingoTranslationService';

interface LingoTranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isTranslating: boolean;
  translateText: (text: string) => Promise<string>;
  preloadingComplete: boolean;
  isInitialized: boolean;
  isProviderMounted: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProviderMounted, setIsProviderMounted] = useState(false);

  // Initialize the provider
  useEffect(() => {
    setIsProviderMounted(true);
    return () => setIsProviderMounted(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initialize the translation context
    const initializeTranslationContext = async () => {
      try {
        if (!mounted || !isProviderMounted) return;

        setIsLoading(true);
        console.log('🔄 Starting translation context initialization...');

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
        await new Promise(resolve => setTimeout(resolve, 200));
        if (mounted && isProviderMounted) {
          console.log('✅ Translation context initialization complete');
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize translation context:', error);
        if (mounted && isProviderMounted) {
          setError('Failed to initialize translation context');
          setIsInitialized(true); // Still set to true to prevent infinite loading
          setIsLoading(false);
        }
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

    return () => {
      mounted = false;
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [isProviderMounted, language]);

  // Mark preloading complete when language changes (dictionary lookups are synchronous)
  useEffect(() => {
    if (!isInitialized || !isProviderMounted) return;
    setPreloadingComplete(true);
  }, [language, isInitialized, isProviderMounted]);

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

  // Don't render children until context is initialized and loading is complete
  if (!isInitialized || isLoading || !isProviderMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Initializing translations...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
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
      isInitialized,
      isProviderMounted
    }}>
      {children}
    </LingoTranslationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLingoTranslation = () => {
  const context = useContext(LingoTranslationContext);

  if (!context) {
    throw new Error('useLingoTranslation must be used within a LingoTranslationProvider');
  }

  if (!context.isProviderMounted) {
    throw new Error('LingoTranslationProvider is not yet mounted');
  }

  if (!context.isInitialized) {
    throw new Error('LingoTranslationProvider is not yet initialized');
  }

  return context;
};
