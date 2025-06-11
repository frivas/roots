import React from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import { lingoTranslationService } from '../services/LingoTranslationService';

const LanguageDebugger: React.FC = () => {
  const { language, isInitialized, preloadingComplete } = useLingoTranslation();
  
  const localStorageValue = localStorage.getItem('selectedLanguage');
  
  const clearAllCache = () => {
    // Clear translation service cache
    lingoTranslationService.clearCache();
    
    // Clear localStorage
    localStorage.removeItem('selectedLanguage');
    localStorage.setItem('selectedLanguage', language);
    
    // Force reload
    window.location.reload();
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-lg text-xs font-mono z-50 shadow-lg">
      <div className="space-y-1">
        <div>Context Lang: <strong>{language}</strong></div>
        <div>localStorage: <strong>{localStorageValue}</strong></div>
        <div>Initialized: <strong>{isInitialized ? '✅' : '❌'}</strong></div>
        <div>Preload Complete: <strong>{preloadingComplete ? '✅' : '❌'}</strong></div>
        <button 
          onClick={clearAllCache}
          className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Clear Cache & Reload
        </button>
      </div>
    </div>
  );
};

export default LanguageDebugger; 