import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/LingoTranslationService', () => ({
  lingoTranslationService: {
    translateText: vi.fn(),
    clearCache: vi.fn(),
    preloadCommonTranslations: vi.fn(),
    getStats: vi.fn(() => ({ cacheSize: 0, localTranslationsCount: 0 })),
  },
}));

describe('useLingoTranslation guard rails', () => {
  afterEach(() => {
    vi.doUnmock('react');
    vi.resetModules();
  });

  it('throws when the provider is not yet mounted', async () => {
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof import('react')>('react');
      return {
        ...actual,
        useContext: vi.fn(() => ({
          isProviderMounted: false,
          isInitialized: true,
        })),
      };
    });

    const { useLingoTranslation } = await import('./LingoTranslationContext');

    expect(() => useLingoTranslation()).toThrow('LingoTranslationProvider is not yet mounted');
  });

  it('throws when the provider is not yet initialized', async () => {
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof import('react')>('react');
      return {
        ...actual,
        useContext: vi.fn(() => ({
          isProviderMounted: true,
          isInitialized: false,
        })),
      };
    });

    const { useLingoTranslation } = await import('./LingoTranslationContext');

    expect(() => useLingoTranslation()).toThrow('LingoTranslationProvider is not yet initialized');
  });
});
