import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
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

const renderProvider = (language?: string) => {
  if (language) window.localStorage.setItem('selectedLanguage', language);
  return render(
    <LingoTranslationProvider>
      <TestConsumer />
    </LingoTranslationProvider>
  );
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

  it('initializes with en-US synchronously by default', () => {
    renderProvider();
    expect(screen.getByTestId('lang').textContent).toBe('en-US');
    expect(screen.getByTestId('initialized').textContent).toBe('true');
  });

  it('reads selectedLanguage from localStorage synchronously', () => {
    renderProvider('es-ES');
    expect(screen.getByTestId('lang').textContent).toBe('es-ES');
    expect(screen.getByTestId('preloaded').textContent).toBe('true');
  });

  it('reads authSelectedLanguage from localStorage and removes it', () => {
    window.localStorage.setItem('authSelectedLanguage', 'es-ES');
    renderProvider();

    expect(window.localStorage.getItem('authSelectedLanguage')).toBeNull();
    expect(window.localStorage.getItem('selectedLanguage')).toBe('es-ES');
  });

  it('responds to external languageChanged events', () => {
    renderProvider();

    act(() => {
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: 'es-ES' } }));
    });

    expect(screen.getByTestId('lang').textContent).toBe('es-ES');
  });

  it('ignores invalid external languageChanged events', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderProvider();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: 'fr-FR' } }));

    expect(screen.getByTestId('lang').textContent).toBe('en-US');
    expect(warnSpy).toHaveBeenCalledWith('Invalid language code received:', 'fr-FR');
  });

  it('setLanguage dispatches languageChanged CustomEvent', () => {
    renderProvider();

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    fireEvent.click(screen.getByTestId('switch-es'));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'languageChanged' })
    );
  });

  it('ignores invalid manual language changes', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderProvider();
    fireEvent.click(screen.getByTestId('switch-invalid'));

    expect(screen.getByTestId('lang').textContent).toBe('en-US');
    expect(warnSpy).toHaveBeenCalledWith('Invalid language code for setLanguage:', 'fr-FR');
  });

  it('returns the original string without calling the service in English mode', async () => {
    renderProvider();

    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('Hello'));
    expect(mockServiceTranslateText).not.toHaveBeenCalled();
  });

  it('calls the translation service in Spanish mode', async () => {
    renderProvider('es-ES');

    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('[es]Hello'));
    expect(mockServiceTranslateText).toHaveBeenCalledWith('Hello', 'es-ES');
  });

  it('returns an empty string for invalid translation input', async () => {
    renderProvider('es-ES');

    fireEvent.click(screen.getByTestId('translate-empty'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe(''));
    expect(mockServiceTranslateText).not.toHaveBeenCalled();
  });

  it('falls back to the original text when the service rejects', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockServiceTranslateText.mockRejectedValueOnce(new Error('translation failed'));

    renderProvider('es-ES');
    fireEvent.click(screen.getByTestId('translate-hello'));

    await waitFor(() => expect(screen.getByTestId('translated').textContent).toBe('Hello'));
    expect(errorSpy).toHaveBeenCalledWith('Translation error:', expect.any(Error));
  });

  it('falls back to English without blocking children when storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('storage failure');
    });

    render(
      <LingoTranslationProvider>
        <div>Child content</div>
      </LingoTranslationProvider>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('keeps callback identities stable across parent rerenders', () => {
    const snapshots: Array<ReturnType<typeof useLingoTranslation>> = [];
    const IdentityConsumer = () => {
      snapshots.push(useLingoTranslation());
      return null;
    };
    const Harness = () => {
      const [count, setCount] = React.useState(0);
      return (
        <>
          <button onClick={() => setCount(value => value + 1)}>rerender {count}</button>
          <LingoTranslationProvider>
            <IdentityConsumer />
          </LingoTranslationProvider>
        </>
      );
    };

    render(<Harness />);
    const first = snapshots.at(-1);
    fireEvent.click(screen.getByRole('button', { name: /rerender/i }));
    const second = snapshots.at(-1);

    expect(second?.setLanguage).toBe(first?.setLanguage);
    expect(second?.translateText).toBe(first?.translateText);
  });
});

describe('useLingoTranslation outside provider', () => {
  it('throws an error', () => {
    const Bad = () => { useLingoTranslation(); return null; };
    // Should throw because context is undefined
    expect(() => render(<Bad />)).toThrow();
  });
});
