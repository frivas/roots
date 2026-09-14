import { useEffect } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const DynamicTitle: React.FC = () => {
  const { language, preloadingComplete, isInitialized } = useLingoTranslation();

  useEffect(() => {
    // Only update title after context is initialized and preloading is complete
    if (!isInitialized || !preloadingComplete) return;

    const metadata = language === 'es-ES'
      ? {
          title: 'Raíces | aprendizaje con IA para familias de Madrid',
          description: 'Tutoría bilingüe con IA, cuentos, bienestar familiar e información escolar para familias de Madrid.',
        }
      : {
          title: 'Raíces | AI learning for Madrid families',
          description: 'Bilingual AI tutoring, storytelling, family wellbeing, and school information for Madrid families.',
        };

    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
  }, [language, preloadingComplete, isInitialized]);

  // This component doesn't render anything
  return null;
};

export default DynamicTitle;
