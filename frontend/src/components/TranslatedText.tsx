import React, { useState, useEffect, useCallback } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import { getSpanishTranslation } from '../services/SpanishTranslations';

interface TranslatedTextProps {
  children: string;
  className?: string;
  element?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  showLoader?: boolean;
  fallback?: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({
  children,
  className = '',
  element = 'span',
  showLoader = false,
  fallback
}) => {
  const { language, translateText, isTranslating } = useLingoTranslation();

  // Initialize with immediate translation if available
  const [translatedText, setTranslatedText] = useState(() => {
    if (language === 'en-US') {
      return children; // Show English text as-is
    }

    // For Spanish, check for immediate translation from English to Spanish
    const immediateTranslation = getSpanishTranslation(children);
    return immediateTranslation !== children ? immediateTranslation : children;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performTranslation = useCallback(async () => {
    setError(null);

    if (language === 'en-US') {
      setTranslatedText(children); // Show English text as-is
      return;
    }

    // Don't translate empty or very short strings
    if (!children || children.trim().length < 2) {
      setTranslatedText(children);
      return;
    }

    // For Spanish, first try immediate English->Spanish dictionary lookup
    const spanishTranslation = getSpanishTranslation(children);
    if (spanishTranslation !== children) {
      setTranslatedText(spanishTranslation);
      return; // Don't need API call
    }

    // If no local translation, use API to translate English->Spanish
    setIsLoading(true);
    try {
      const translated = await translateText(children);
      setTranslatedText(translated || children);
    } catch (error) {
      console.error('Translation failed:', error);
      setError('Translation failed');
      setTranslatedText(fallback || children);
    } finally {
      setIsLoading(false);
    }
  }, [children, language, translateText, fallback]);

  useEffect(() => {
    performTranslation();
  }, [performTranslation]);

  const Element = element as keyof React.JSX.IntrinsicElements;

  // Always render something - never return null or empty
  return React.createElement(Element, { className },
    showLoader && isLoading ? (
      React.createElement('span', { className: 'opacity-60' }, translatedText)
    ) : (
      translatedText || children || fallback || ''
    )
  );
};

export default TranslatedText;
