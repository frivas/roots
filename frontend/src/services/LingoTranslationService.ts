import { LingoDotDevEngine } from "lingo.dev/sdk";
import { getSpanishTranslation, hasSpanishTranslation, spanishTranslations } from "./SpanishTranslations";

class LingoTranslationService {
  private engine: LingoDotDevEngine;
  private cache: Map<string, string> = new Map();

  constructor() {
    const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(' [VITE_GROQ_API_KEY_REMOVED]environment variable is required');
    }

    this.engine = new LingoDotDevEngine({
      apiKey: apiKey,
      batchSize: 50,
      idealBatchItemSize: 1000,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  async translateText(text: string, targetLocale: string): Promise<string> {
    // Return original text if source language
    if (targetLocale === 'en-US') {
      return text;
    }

    // For Spanish, ALWAYS check our local dictionary first
    if (targetLocale === 'es-ES') {
      const localTranslation = getSpanishTranslation(text);
      //console.log(`✅ Using local Spanish translation for: "${text}" -> "${localTranslation}"`);
      return localTranslation;
    }

    // Check cache next
    const cacheKey = `${text}_${targetLocale}`;
    if (this.cache.has(cacheKey)) {
      const cachedTranslation = this.cache.get(cacheKey)!;
      console.log(`🔍 Using cached translation for: "${text}" -> "${cachedTranslation}"`);
      return cachedTranslation;
    }

    // If we're in development and using localhost, skip API call and return text
    if (window.location.hostname === 'localhost') {
      console.log(`🏠 Development mode: skipping API call for: "${text}"`);
      return text;
    }

    try {
      console.log(`🌐 Requesting Lingo.dev translation for: "${text}"`);
      // Use SDK for real-time translation
      const result = await this.engine.localizeText(text, {
        sourceLocale: "en-US",
        targetLocale: targetLocale
      });

      // Cache result for future use
      this.cache.set(cacheKey, result);
      console.log(`✅ Lingo.dev translation completed: "${text}" -> "${result}"`);
      return result;
    } catch (error) {
      console.error('Translation failed for:', text, error);

      // For Spanish, fallback to local dictionary if Lingo.dev fails
      if (targetLocale === 'es-ES' && hasSpanishTranslation(text)) {
        const fallbackTranslation = getSpanishTranslation(text);
        console.log(`🔄 Fallback to local Spanish translation: "${text}" -> "${fallbackTranslation}"`);
        return fallbackTranslation;
      }

      // Ultimate fallback to original text
      return text;
    }
  }

  async translateObject(obj: Record<string, any>, targetLocale: string): Promise<Record<string, any>> {
    if (targetLocale === 'en-US') {
      return obj;
    }

    // For Spanish, try to translate individual properties using our dictionary first
    if (targetLocale === 'es-ES') {
      const translatedObj: Record<string, any> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          translatedObj[key] = await this.translateText(value, targetLocale);
        } else if (typeof value === 'object' && value !== null) {
          translatedObj[key] = await this.translateObject(value, targetLocale);
        } else {
          translatedObj[key] = value;
        }
      }

      return translatedObj;
    }

    try {
      return await this.engine.localizeObject(obj, {
        sourceLocale: "en-US",
        targetLocale: targetLocale
      });
    } catch (error) {
      console.error('Object translation failed:', error);
      return obj;
    }
  }

  async translateHtml(html: string, targetLocale: string): Promise<string> {
    if (targetLocale === 'en-US') {
      return html;
    }

    try {
      return await this.engine.localizeHtml(html, {
        sourceLocale: "en-US",
        targetLocale: targetLocale
      });
    } catch (error) {
      console.error('HTML translation failed:', error);
      return html;
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Translation cache cleared');
  }

  // Get translation statistics
  getStats(): { cacheSize: number, localTranslationsCount: number } {
    return {
      cacheSize: this.cache.size,
      localTranslationsCount: Object.keys(spanishTranslations).length
    };
  }

  // Preload common translations into cache
  async preloadCommonTranslations(targetLocale: string): Promise<void> {
    if (targetLocale !== 'es-ES') return;

    const commonPhrases = [
      "Home", "Settings", "Profile", "Messages", "Notifications",
      "Welcome to Raíces!", "Save", "Cancel", "Edit", "Delete", "Search"
    ];

    console.log('🚀 Preloading common translations...');
    for (const phrase of commonPhrases) {
      await this.translateText(phrase, targetLocale);
    }
    console.log('✅ Common translations preloaded');
  }
}

// Export singleton instance
export const lingoTranslationService = new LingoTranslationService();
