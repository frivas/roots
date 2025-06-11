import React, { useEffect, useState } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface RouteWrapperProps {
  children: React.ReactNode;
  routeName?: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ children, routeName }) => {
  const { isInitialized, preloadingComplete } = useLingoTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure everything is ready before showing content
    const timer = setTimeout(() => {
      if (isInitialized && preloadingComplete) {
        setIsReady(true);
      }
    }, 50); // Minimal delay to prevent race conditions

    return () => clearTimeout(timer);
  }, [isInitialized, preloadingComplete]);

  // Force ready state if it takes too long (fallback)
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsReady(true);
    }, 2000); // 2 second fallback

    return () => clearTimeout(fallbackTimer);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteWrapper; 