import { useState, useEffect } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

/**
 * Hook that returns a translated string for use in HTML attributes
 * (placeholder, alt, title) where <TranslatedText> can't be used.
 *
 * Translation resources are loaded by the context only when Spanish is active.
 */
function useTranslatedString(text: string): string {
  const { language, translateText } = useLingoTranslation();

  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let cancelled = false;

    if (language === 'en-US') {
      setTranslated(text);
      return () => {
        cancelled = true;
      };
    }

    void translateText(text)
      .then(result => {
        if (!cancelled) setTranslated(result || text);
      })
      .catch(() => {
        if (!cancelled) setTranslated(text);
      });

    return () => {
      cancelled = true;
    };
  }, [text, language, translateText]);

  return translated;
}

export default useTranslatedString;
