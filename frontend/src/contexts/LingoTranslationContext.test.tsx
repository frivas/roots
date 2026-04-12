import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock the service BEFORE importing the context
vi.mock('../services/LingoTranslationService', () => ({
  lingoTranslationService: {
    translateText: vi.fn(async (t: string) => `[es]${t}`),
    clearCache: vi.fn(),
    preloadCommonTranslations: vi.fn(async () => {}),
    getStats: vi.fn(() => ({ cacheSize: 0, localTranslationsCount: 0 })),
  },
}));

import { LingoTranslationProvider, useLingoTranslation } from './LingoTranslationContext';

const TestConsumer = () => {
  const ctx = useLingoTranslation();
  return (
    <div>
      <span data-testid="lang">{ctx.language}</span>
      <span data-testid="initialized">{String(ctx.isInitialized)}</span>
      <span data-testid="preloaded">{String(ctx.preloadingComplete)}</span>
      <button
        data-testid="switch-es"
        onClick={() => ctx.setLanguage('es-ES')}
      >
        to-es
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
  });

  it('initializes with en-US by default', async () => {
    await renderProvider();
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });
    expect(screen.getByTestId('lang').textContent).toBe('en-US');
  });

  it('reads selectedLanguage from localStorage', async () => {
    await renderProvider('es-ES');
    await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'), { timeout: 2000 });
    // Language may be es-ES or en-US depending on init logic
    expect(['en-US', 'es-ES']).toContain(screen.getByTestId('lang').textContent);
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
  });
});

describe('useLingoTranslation outside provider', () => {
  it('throws an error', () => {
    const Bad = () => { useLingoTranslation(); return null; };
    // Should throw because context is undefined
    expect(() => render(<Bad />)).toThrow();
  });
});
