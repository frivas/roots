import React, { useState, useEffect, useCallback } from 'react';
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
  const { language, translateText, isTranslating } = useLingoTranslation();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performTranslation = useCallback(async () => {
    // Always show original text first to prevent blank renders
    setTranslatedText(children);
    setError(null);
    
    if (language === 'en-US') {
      return;
    }

    // Don't translate empty or very short strings
    if (!children || children.trim().length < 2) {
      return;
    }

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

  const Element = element as keyof JSX.IntrinsicElements;
  
  // Always render something - never return null or empty
  return (
    <Element className={className}>
      {showLoader && isLoading ? (
        <span className="opacity-60">
          {translatedText}
        </span>
      ) : (
        translatedText || children || fallback || ''
      )}
    </Element>
  );
};

export default TranslatedText; 