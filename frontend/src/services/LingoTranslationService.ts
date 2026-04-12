import { getSpanishTranslation, spanishTranslations } from "./SpanishTranslations";

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

  async translateObject(obj: Record<string, unknown>, targetLocale: string): Promise<Record<string, unknown>> {
    if (targetLocale === 'en-US') {
      return obj;
    }

    const translatedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        translatedObj[key] = await this.translateText(value, targetLocale);
      } else if (typeof value === 'object' && value !== null) {
        translatedObj[key] = await this.translateObject(value as Record<string, unknown>, targetLocale);
      } else {
        translatedObj[key] = value;
      }
    }

    return translatedObj;
  }

  async translateHtml(html: string, targetLocale: string): Promise<string> {
    if (targetLocale === 'en-US') {
      return html;
    }
    return html;
  }

  clearCache(): void {
    // No-op — dictionary lookups don't require caching
  }

  getStats(): { cacheSize: number; localTranslationsCount: number } {
    return {
      cacheSize: 0,
      localTranslationsCount: Object.keys(spanishTranslations).length,
    };
  }

  async preloadCommonTranslations(): Promise<void> {
    // No-op — dictionary lookups are synchronous
  }
}

// Export singleton instance
export const lingoTranslationService = new LingoTranslationService();
