import React, { useState, useEffect } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

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
  const { language, translateText } = useLingoTranslation();

  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (language === 'en-US') {
      setTranslatedText(children);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (!children || children.trim().length < 2) {
      setTranslatedText(children);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    void translateText(children)
      .then(translated => {
        if (!cancelled) setTranslatedText(translated || children);
      })
      .catch(error => {
        console.error('Translation failed:', error);
        if (!cancelled) setTranslatedText(fallback || children);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [children, language, translateText, fallback]);

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
