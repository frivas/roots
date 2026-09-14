import { getSpanishTranslation } from './SpanishTranslations';

class LingoTranslationService {
  async translateText(text: string, targetLocale: string): Promise<string> {
    if (targetLocale === 'en-US') {
      return text;
    }

    if (targetLocale === 'es-ES') {
      return getSpanishTranslation(text);
    }

    // Unsupported locale — return original
    return text;
  }
}

// Export singleton instance
export const lingoTranslationService = new LingoTranslationService();
