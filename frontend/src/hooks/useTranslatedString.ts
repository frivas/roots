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

  const translationKey = `${language}\u0000${text}`;
  const [resolvedTranslation, setResolvedTranslation] = useState({
    key: '',
    text,
  });
  const shouldTranslate = language === 'es-ES';

  useEffect(() => {
    if (!shouldTranslate) return;

    let cancelled = false;

    void translateText(text)
      .then(result => {
        if (!cancelled) {
          setResolvedTranslation({ key: translationKey, text: result || text });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedTranslation({ key: translationKey, text });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldTranslate, text, translateText, translationKey]);

  return shouldTranslate && resolvedTranslation.key === translationKey
    ? resolvedTranslation.text
    : text;
}

export default useTranslatedString;
