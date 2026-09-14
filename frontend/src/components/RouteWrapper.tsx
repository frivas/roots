import React, { useEffect, useRef } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface RouteWrapperProps {
  children: React.ReactNode;
  routeName?: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isInitialized, preloadingComplete } = useLingoTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialized || !preloadingComplete) return;

    const heading = contentRef.current?.querySelector<HTMLElement>('h1');
    if (!heading) return;

    heading.tabIndex = -1;
    heading.focus();
  }, [isInitialized, preloadingComplete]);

  if (!isInitialized || !preloadingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }

  return <div ref={contentRef} className="contents">{children}</div>;
};

export default RouteWrapper;
