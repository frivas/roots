import { vi } from 'vitest';

/**
 * Install a vi.mock for lingo.dev/sdk.
 * Call at the top level of a test file (Vitest hoists vi.mock before imports).
 *
 * The mock engine prefixes translated text with "[es]" so tests can assert
 * that translation was attempted without hitting any real API.
 */
export const installLingoSdkMock = () => {
  vi.mock('lingo.dev/sdk', () => ({
    LingoDotDevEngine: vi.fn().mockImplementation(() => ({
      localizeText: vi.fn(async (t: string) => `[es]${t}`),
      localizeObject: vi.fn(async <T>(o: T): Promise<T> => o),
      localizeHtml: vi.fn(async (h: string) => h),
    })),
  }));
};

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
