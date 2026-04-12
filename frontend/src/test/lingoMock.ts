import { vi } from 'vitest';

/**
 * Build a mock value suitable for providing via LingoTranslationContext.
 * Useful in tests that mock the whole context module rather than rendering
 * the real LingoTranslationProvider.
 */
export const mockLingoContextValue = (language: 'en-US' | 'es-ES' = 'en-US') => ({
  language,
  setLanguage: vi.fn(),
  isTranslating: false,
  translateText: vi.fn(async (text: string) =>
    language === 'es-ES' ? `[es]${text}` : text
  ),
  preloadingComplete: true,
  isInitialized: true,
  isProviderMounted: true,
});
