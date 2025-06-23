import React, { useState } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import TranslatedText from './TranslatedText';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { lingoTranslationService } from '../services/LingoTranslationService';

const TranslationDebugger: React.FC = () => {
  const { language, setLanguage, isTranslating, preloadingComplete } = useLingoTranslation();
  const [stats, setStats] = useState<{ cacheSize: number; localTranslationsCount: number } | null>(null);
  const [testText, setTestText] = useState('Welcome to Raíces!');
  const [translatedResult, setTranslatedResult] = useState('');

  const sampleTexts = [
    'Home',
    'Welcome to Raíces!',
    'Here\'s an overview of your educational journey.',
    'Upcoming Classes',
    'Active Programs',
    'New Messages',
    'Learning Activity',
    'Quick Actions',
    'Recent Courses',
    'Settings',
    'Profile',
    'Notifications',
    'Sign out'
  ];

  const toggleLanguage = async () => {
    const newLang = language === 'en-US' ? 'es-ES' : 'en-US';

    // Dispatch custom event for LanguageSwitcher compatibility
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: newLang }
    }));
  };

  const getStats = () => {
    const serviceStats = lingoTranslationService.getStats();
    setStats(serviceStats);
  };

  const testTranslation = async () => {
    if (testText.trim()) {
      const result = await lingoTranslationService.translateText(testText, language);
      setTranslatedResult(result);
    }
  };

  const clearCache = () => {
    lingoTranslationService.clearCache();
    setStats(null);
    console.log('Translation cache cleared');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Translation System Debugger
        </CardTitle>
        <p className="text-muted-foreground">
          Test and monitor the Lingo.dev + Spanish dictionary translation system
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Controls */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="font-medium">Current Language:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${language === 'es-ES'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
              {language === 'es-ES' ? 'Español (ES)' : 'English (US)'}
            </span>
          </div>
          <Button onClick={toggleLanguage}>
            Switch to {language === 'es-ES' ? 'English' : 'Spanish'}
          </Button>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${preloadingComplete ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="text-sm">
              {preloadingComplete ? 'Preload Complete' : 'Preloading...'}
            </span>
          </div>
        </div>

        {/* Translation Status */}
        {isTranslating && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 dark:text-blue-300">Translating...</span>
          </div>
        )}

        {/* Sample Translations */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Sample Translations</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {sampleTexts.map((text, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium text-muted-foreground flex-1">
                  {text}
                </span>
                <span className="text-sm flex-1 text-right">
                  <TranslatedText>{text}</TranslatedText>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Translation Test */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Manual Translation Test</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to translate..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={testTranslation}>
                Translate
              </Button>
            </div>
            {translatedResult && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Result: {translatedResult}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Translation Statistics</h3>
          <div className="flex gap-2 mb-3">
            <Button onClick={getStats} variant="outline">
              Get Stats
            </Button>
            <Button onClick={clearCache} variant="outline">
              Clear Cache
            </Button>
          </div>
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-muted-foreground">Cache Size</h4>
                <p className="text-2xl font-bold">{stats.cacheSize}</p>
                <p className="text-sm text-muted-foreground">Cached translations</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-muted-foreground">Local Dictionary</h4>
                <p className="text-2xl font-bold">{stats.localTranslationsCount}</p>
                <p className="text-sm text-muted-foreground">Spanish translations available</p>
              </div>
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Local Dictionary First:</strong> Instant translations from our Spanish dictionary</li>
            <li>• <strong>Cache Layer:</strong> Stores API translations for future use</li>
            <li>• <strong>Lingo.dev Fallback:</strong> Uses AI translation for missing strings</li>
            <li>• <strong>Error Resilience:</strong> Falls back to local dictionary if API fails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationDebugger;
