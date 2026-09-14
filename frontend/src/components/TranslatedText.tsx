import React, { useEffect, useState } from 'react';
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

  const translationKey = `${language}\u0000${children}\u0000${fallback ?? ''}`;
  const [resolvedTranslation, setResolvedTranslation] = useState({
    key: '',
    text: children,
  });
  const shouldTranslate = language === 'es-ES' && children.trim().length >= 2;

  useEffect(() => {
    if (!shouldTranslate) return;

    let cancelled = false;
    void translateText(children)
      .then(translated => {
        if (!cancelled) {
          setResolvedTranslation({
            key: translationKey,
            text: translated || children,
          });
        }
      })
      .catch(error => {
        console.error('Translation failed:', error);
        if (!cancelled) {
          setResolvedTranslation({
            key: translationKey,
            text: fallback || children,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [children, fallback, shouldTranslate, translateText, translationKey]);

  const hasCurrentTranslation = resolvedTranslation.key === translationKey;
  const translatedText = shouldTranslate && hasCurrentTranslation
    ? resolvedTranslation.text
    : fallback || children;
  const isLoading = shouldTranslate && !hasCurrentTranslation;

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
