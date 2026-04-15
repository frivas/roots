import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

const mockServiceTranslateText = vi.fn(async (t: string) => `[es]${t}`);

// Mock the service BEFORE importing the context
vi.mock('../services/LingoTranslationService', () => ({
  lingoTranslationService: {
    translateText: (...args: unknown[]) => mockServiceTranslateText(...args),
    clearCache: vi.fn(),
    preloadCommonTranslations: vi.fn(async () => {}),
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
      <span data-testid="is-translating">{String(ctx.isTranslating)}</span>
      <span data-testid="translated">{translated}</span>
      <button
        data-testid="switch-es"
        onClick={() => ctx.setLanguage('es-ES')}
      >
        to-es
      </button>
      <button
        data-testid="switch-invalid"
        onClick={() => ctx.setLanguage('fr-FR')}
      >
        invalid
      </button>
      <button
        data-testid="translate-hello"
        onClick={async () => setTranslated(await ctx.translateText('Hello'))}
      >
        translate-hello
      </button>
      <button
        data-testid="translate-empty"
        onClick={async () => setTranslated(await ctx.translateText(''))}
      >
        translate-empty
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
    mockServiceTranslateText.mockReset();
    mockServiceTranslateText.mockImplementation(async (t: string) => `[es]${t}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(screen.getByTestId('preloaded').textContent).toBe('true');
  });

  it('reads authSelectedLanguage from localStorage and removes it', async () => {
    window.localStorage.setItem('authSelectedLanguage', 'es-ES');
    await renderProvider();
    // authSelectedLanguage should be cleared during initialization
    await waitFor(
      () => expect(window.localStorage.getItem('authSelectedLanguage')).toBeNull(),
      { timeout: 2000 }
    );
    expect(window.localStorage.getItem('selectedLanguage')).toBe('es-ES');
  });

  it('applies an auth-selected language discovered during initialization', async () => {
    const originalGetItem = Storage.prototype.getItem;
    let authReadCount = 0;

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key: string) {
      if (key === 'authSelectedLanguage') {
        authReadCount += 1;
        return authReadCount >= 3 ? 'es-ES' : null;
      }

      if (key === 'selectedLanguage') {
        return null;
      }

      return originalGetItem.call(this, key);
    });

    await renderProvider();

    await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe('es-ES'));
    getItemSpy.mockRestore();
  });

  it('responds to external languageChanged events', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: 'es-ES' } }));

    await waitFor(() => expect(screen.getByTestId('lang').textContent).toBe('es-ES'), { timeout: 2000 });
  });

  it('ignores invalid external languageChanged events', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await renderProvider();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: 'fr-FR' } }));

    expect(screen.getByTestId('lang').textContent).toBe('en-US');
    expect(warnSpy).toHaveBeenCalledWith('Invalid language code received:', 'fr-FR');
  });

  it('setLanguage dispatches languageChanged CustomEvent', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    fireEvent.click(screen.getByTestId('switch-es'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'languageChanged' })
    );
  });

  it('ignores invalid manual language changes', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await renderProvider();
    fireEvent.click(screen.getByTestId('switch-invalid'));

    expect(screen.getByTestId('lang').textContent).toBe('en-US');
    expect(warnSpy).toHaveBeenCalledWith('Invalid language code for setLanguage:', 'fr-FR');
  });

  it('returns the original string without calling the service in English mode', async () => {
    await renderProvider();

    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('Hello'));
    expect(mockServiceTranslateText).not.toHaveBeenCalled();
  });

  it('calls the translation service in Spanish mode', async () => {
    await renderProvider('es-ES');

    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('[es]Hello'));
    expect(mockServiceTranslateText).toHaveBeenCalledWith('Hello', 'es-ES');
  });

  it('returns an empty string for invalid translation input', async () => {
    await renderProvider('es-ES');

    fireEvent.click(screen.getByTestId('translate-empty'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe(''));
    expect(mockServiceTranslateText).not.toHaveBeenCalled();
  });

  it('falls back to the original text when the service rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockServiceTranslateText.mockRejectedValueOnce(new Error('translation failed'));

    await renderProvider('es-ES');
    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('Hello'));
    expect(errorSpy).toHaveBeenCalledWith('Translation error:', expect.any(Error));
  });

  it('shows an error state when initialization fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('storage failure');
    });

    render(
      <LingoTranslationProvider>
        <div>Should not render</div>
      </LingoTranslationProvider>
    );

    await waitFor(() => expect(screen.getByText('Failed to initialize translation context')).toBeInTheDocument(), {
      timeout: 2000,
    });
  });
});

describe('useLingoTranslation outside provider', () => {
  it('throws an error', () => {
    const Bad = () => { useLingoTranslation(); return null; };
    // Should throw because context is undefined
    expect(() => render(<Bad />)).toThrow();
  });
});
