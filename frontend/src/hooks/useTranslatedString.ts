import { useState, useEffect } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import { getSpanishTranslation } from '../services/SpanishTranslations';

/**
 * Hook that returns a translated string for use in HTML attributes
 * (placeholder, alt, title) where <TranslatedText> can't be used.
 *
 * Uses sync dictionary first for instant render, falls back to async API.
 */
function useTranslatedString(text: string): string {
  const { language, translateText } = useLingoTranslation();

  const [translated, setTranslated] = useState(() => {
    if (language === 'en-US') return text;
    const t = getSpanishTranslation(text);
    return t !== text ? t : text;
  });

  useEffect(() => {
    if (language === 'en-US') {
      setTranslated(text);
      return;
    }

    const t = getSpanishTranslation(text);
    if (t !== text) {
      setTranslated(t);
      return;
    }

    translateText(text).then(r => setTranslated(r || text));
  }, [text, language, translateText]);

  return translated;
}

export default useTranslatedString;
