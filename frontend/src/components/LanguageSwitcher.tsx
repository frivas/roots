import React from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const LanguageSwitcher: React.FC = () => {
  const { language } = useLingoTranslation();

  const handleLanguageChange = (newLanguage: string) => {
    // Dispatch the language change event that the context listens for
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: newLanguage }
    }));
  };

  const toggleLanguage = () => {
    const newLang = language === 'en-US' ? 'es-ES' : 'en-US';
    handleLanguageChange(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted hover:text-foreground"
      title={`Switch to ${language === 'en-US' ? 'Spanish' : 'English'}`}
    >
      <span className="font-semibold">
        {language === 'es-ES' ? 'ES' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher; 