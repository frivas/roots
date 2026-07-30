import React from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface RouteWrapperProps {
  children: React.ReactNode;
  routeName?: string;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ children }) => {
  const { isInitialized, preloadingComplete } = useLingoTranslation();
  if (!isInitialized || !preloadingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="md" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteWrapper;
