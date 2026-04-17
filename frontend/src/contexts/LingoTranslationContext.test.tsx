import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

const mocks = vi.hoisted(() => ({
  translateText: vi.fn(async (text: string) => `[es]${text}`),
  clearCache: vi.fn(),
  preloadCommonTranslations: vi.fn(async () => {}),
}));

// Mock the service BEFORE importing the context
vi.mock('../services/LingoTranslationService', () => ({
  lingoTranslationService: {
    translateText: mocks.translateText,
    clearCache: mocks.clearCache,
    preloadCommonTranslations: mocks.preloadCommonTranslations,
    getStats: vi.fn(() => ({ cacheSize: 0, localTranslationsCount: 0 })),
  },
}));

import { LingoTranslationProvider, useLingoTranslation } from './LingoTranslationContext';

const TestConsumer = () => {
  const ctx = useLingoTranslation();
  const [translated, setTranslated] = React.useState('');

  return (
    <div>
      <span data-testid="lang">{ctx.language}</span>
      <span data-testid="initialized">{String(ctx.isInitialized)}</span>
      <span data-testid="preloaded">{String(ctx.preloadingComplete)}</span>
      <span data-testid="translated">{translated}</span>
      <button
        data-testid="switch-es"
        onClick={() => ctx.setLanguage('es-ES')}
      >
        to-es
      </button>
      <button
        data-testid="switch-invalid"
        onClick={() => ctx.setLanguage('fr-FR' as never)}
      >
        invalid
      </button>
      <button
        data-testid="translate-empty"
        onClick={async () => setTranslated(await ctx.translateText(''))}
      >
        empty
      </button>
      <button
        data-testid="translate-hello"
        onClick={async () => setTranslated(await ctx.translateText('Hello'))}
      >
        hello
      </button>
    </div>
  );
};

// Helper: render the provider and wait for initialization to complete
const renderProvider = async (language?: string) => {
  if (language) window.localStorage.setItem('selectedLanguage', language);
  const result = render(
    <LingoTranslationProvider>
      <TestConsumer />
    </LingoTranslationProvider>
  );
  // Wait for the loading spinner to disappear and the consumer to appear
  await waitFor(
    () => expect(screen.getByTestId('initialized')).toBeInTheDocument(),
    { timeout: 2000 }
  );
  return result;
};

describe('LingoTranslationProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.translateText.mockReset();
    mocks.translateText.mockImplementation(async (text: string) => `[es]${text}`);
    mocks.clearCache.mockReset();
    mocks.preloadCommonTranslations.mockReset();
    mocks.preloadCommonTranslations.mockImplementation(async () => {});
  });

  it('initializes with en-US by default', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });
    expect(screen.getByTestId('lang').textContent).toBe('en-US');
  });

  it('reads selectedLanguage from localStorage', async () => {
    await renderProvider('es-ES');
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });
    expect(screen.getByTestId('lang').textContent).toBe('es-ES');
  });

  it('reads authSelectedLanguage from localStorage and removes it', async () => {
    window.localStorage.setItem('authSelectedLanguage', 'es-ES');
    await renderProvider();
    // authSelectedLanguage should be cleared during initialization
    await waitFor(
      () => expect(window.localStorage.getItem('authSelectedLanguage')).toBeNull(),
      { timeout: 2000 }
    );
  });

  it('responds to external languageChanged events', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: 'es-ES' } }));

    await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe('es-ES'), { timeout: 2000 });
  });

  it('setLanguage dispatches languageChanged CustomEvent', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    fireEvent.click(screen.getByTestId('switch-es'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'languageChanged' })
    );
    expect(window.localStorage.getItem('selectedLanguage')).toBe('es-ES');
  });

  it('ignores invalid external language change events', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: 'fr-FR' } }));

    await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe('en-US'), { timeout: 2000 });
  });

  it('ignores invalid manual language changes', async () => {
    await renderProvider();
    fireEvent.click(screen.getByTestId('switch-invalid'));
    expect(screen.getByTestId('lang').textContent).toBe('en-US');
  });

  it('preloads translations when the initial language is Spanish', async () => {
    await renderProvider('es-ES');

    await waitFor(() => expect(screen.getByTestId('preloaded').textContent).toBe('true'), { timeout: 2000 });
    expect(mocks.clearCache).toHaveBeenCalled();
    expect(mocks.preloadCommonTranslations).toHaveBeenCalledWith('es-ES');
  });

  it('returns an empty string for falsy translateText input', async () => {
    await renderProvider();
    fireEvent.click(screen.getByTestId('translate-empty'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe(''));
    expect(mocks.translateText).not.toHaveBeenCalled();
  });

  it('returns the original text for English translations', async () => {
    await renderProvider();
    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('Hello'));
    expect(mocks.translateText).not.toHaveBeenCalled();
  });

  it('uses the translation service for Spanish translations', async () => {
    await renderProvider('es-ES');
    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('[es]Hello'));
    expect(mocks.translateText).toHaveBeenCalledWith('Hello', 'es-ES');
  });

  it('falls back to the original text when the translation service throws', async () => {
    mocks.translateText.mockRejectedValueOnce(new Error('boom'));
    await renderProvider('es-ES');
    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('Hello'));
  });
});

describe('useLingoTranslation outside provider', () => {
  it('throws an error', () => {
    const Bad = () => { useLingoTranslation(); return null; };
    // Should throw because context is undefined
    expect(() => render(<Bad />)).toThrow();
  });
});
