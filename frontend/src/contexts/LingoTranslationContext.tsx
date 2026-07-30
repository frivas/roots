import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type SupportedLanguage = 'en-US' | 'es-ES';

interface LingoTranslationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: string) => void;
  /** @deprecated Translation progress is request-local in rendering consumers. */
  isTranslating: false;
  translateText: (text: string) => Promise<string>;
  preloadingComplete: true;
  isInitialized: true;
  isProviderMounted: true;
}

const LingoTranslationContext = createContext<LingoTranslationContextType | undefined>(undefined);

const isSupportedLanguage = (language: unknown): language is SupportedLanguage =>
  language === 'en-US' || language === 'es-ES';

const readInitialLanguage = (): SupportedLanguage => {
  try {
    const authLanguage = localStorage.getItem('authSelectedLanguage');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const language = isSupportedLanguage(authLanguage)
      ? authLanguage
      : isSupportedLanguage(savedLanguage)
        ? savedLanguage
        : 'en-US';

    if (isSupportedLanguage(authLanguage)) {
      localStorage.removeItem('authSelectedLanguage');
      localStorage.setItem('selectedLanguage', authLanguage);
    }

    return language;
  } catch {
    return 'en-US';
  }
};

export const LingoTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(readInitialLanguage);

  const persistLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem('selectedLanguage', nextLanguage);
    } catch {
      // Storage can be unavailable in privacy modes; in-memory language still works.
    }
  }, []);

  const setLanguage = useCallback((nextLanguage: string) => {
    if (!isSupportedLanguage(nextLanguage)) {
      console.warn('Invalid language code for setLanguage:', nextLanguage);
      return;
    }

    persistLanguage(nextLanguage);
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: nextLanguage },
    }));
  }, [persistLanguage]);

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const nextLanguage = (event as CustomEvent<{ language?: unknown }>).detail?.language;
      if (!isSupportedLanguage(nextLanguage)) {
        console.warn('Invalid language code received:', nextLanguage);
        return;
      }
      persistLanguage(nextLanguage);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, [persistLanguage]);

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || typeof text !== 'string') return '';
    if (language === 'en-US') return text;

    try {
      const { lingoTranslationService } = await import('../services/LingoTranslationService');
      const translated = await lingoTranslationService.translateText(text, language);
      return translated || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [language]);

  const value = useMemo<LingoTranslationContextType>(() => ({
    language,
    setLanguage,
    isTranslating: false,
    translateText,
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  }), [language, setLanguage, translateText]);

  return (
    <LingoTranslationContext.Provider value={value}>
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
