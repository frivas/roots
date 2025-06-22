import { useEffect } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const DynamicTitle: React.FC = () => {
  const { language, translateText, preloadingComplete, isInitialized } = useLingoTranslation();

  useEffect(() => {
    // Only update title after context is initialized and preloading is complete
    if (!isInitialized || !preloadingComplete) return;

    const updateTitle = async () => {
      const originalTitle = 'Raíces - Educational Management System for Madrid Community';
      
      try {
        const translatedTitle = await translateText(originalTitle);
        document.title = translatedTitle;
      } catch (error) {
        console.error('Failed to translate title:', error);
        // Fallback to original title
        document.title = originalTitle;
      }
    };

    updateTitle();
  }, [language, translateText, preloadingComplete, isInitialized]);

  // This component doesn't render anything
  return null;
};

export default DynamicTitle; 