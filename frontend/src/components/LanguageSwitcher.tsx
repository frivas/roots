import React from 'react';
import { useLocation } from 'react-router';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLingoTranslation();
  const location = useLocation();

  const handleLanguageChange = (newLanguage: string) => {
    // Check if we're on an auth page
    const isAuthPage = location.pathname.startsWith('/auth/');
    
    if (isAuthPage) {
      // Store auth language selection for post-login use
      localStorage.setItem('authSelectedLanguage', newLanguage);
      console.log(`🔐 Auth page language selection stored: ${newLanguage}`);
      
      // Also update the regular language storage as backup
      localStorage.setItem('selectedLanguage', newLanguage);
    }
    
    setLanguage(newLanguage);
  };

  return (
    <div className="inline-flex rounded-md border border-border bg-background p-0.5" role="group" aria-label={language === 'es-ES' ? 'Idioma' : 'Language'}>
      {([
        ['en-US', 'EN', language === 'es-ES' ? 'Usar inglés' : 'Use English'],
        ['es-ES', 'ES', language === 'es-ES' ? 'Usar español' : 'Use Spanish'],
      ] as const).map(([value, label, accessibleName]) => (
        <button
          key={value}
          type="button"
          onClick={() => handleLanguageChange(value)}
          aria-label={accessibleName}
          aria-pressed={language === value}
          className={`min-h-9 rounded px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            language === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
