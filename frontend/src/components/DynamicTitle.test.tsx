import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';

const mockUseLingoTranslation = vi.hoisted(() =>
  vi.fn(() => ({
    language: 'en-US',
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: vi.fn(async (t: string) => t),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  }))
);

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: mockUseLingoTranslation,
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import DynamicTitle from './DynamicTitle';

describe('DynamicTitle', () => {
  beforeEach(() => {
    mockUseLingoTranslation.mockReset();
    mockUseLingoTranslation.mockReturnValue({
      language: 'en-US',
      setLanguage: vi.fn(),
      isTranslating: false,
      translateText: vi.fn(async (t: string) => t),
      preloadingComplete: true,
      isInitialized: true,
      isProviderMounted: true,
    });
  });

  it('renders null (returns nothing visible)', () => {
    const { container } = render(
      <MemoryRouter>
        <DynamicTitle />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('sets document.title when initialized and preloaded', async () => {
    document.title = '';
    render(
      <MemoryRouter>
        <DynamicTitle />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(document.title).not.toBe('');
    });
    expect(document.title).toContain('Raíces');
  });

  it('localizes the title and sharing description for Spanish', async () => {
    document.head.innerHTML = '<meta name="description" content=""><meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="es_ES"><meta property="og:title" content=""><meta property="og:description" content=""><meta name="twitter:title" content=""><meta name="twitter:description" content="">';
    mockUseLingoTranslation.mockReturnValue({
      language: 'es-ES',
      setLanguage: vi.fn(),
      isTranslating: false,
      translateText: vi.fn(async (text: string) => text),
      preloadingComplete: true,
      isInitialized: true,
      isProviderMounted: true,
    });

    render(<DynamicTitle />);

    await waitFor(() => expect(document.title).toContain('aprendizaje con IA'));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      expect.stringContaining('Tutoría bilingüe con IA'),
    );
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      document.title,
    );
    expect(document.documentElement).toHaveAttribute('lang', 'es');
    expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute('content', 'es_ES');
    expect(document.querySelector('meta[property="og:locale:alternate"]')).toHaveAttribute('content', 'en_US');
  });

  it('does not set document.title when not initialized', async () => {
    mockUseLingoTranslation.mockReturnValueOnce({
      language: 'en-US',
      setLanguage: vi.fn(),
      isTranslating: false,
      translateText: vi.fn(async (t: string) => t),
      preloadingComplete: false,
      isInitialized: false,
      isProviderMounted: false,
    });

    document.title = 'unchanged';
    render(
      <MemoryRouter>
        <DynamicTitle />
      </MemoryRouter>
    );

    // Give it a moment; title should remain unchanged
    await new Promise((r) => setTimeout(r, 100));
    expect(document.title).toBe('unchanged');
  });

  it('uses stable local metadata when dynamic translation is unavailable', async () => {
    mockUseLingoTranslation.mockReturnValueOnce({
      language: 'es-ES',
      setLanguage: vi.fn(),
      isTranslating: false,
      translateText: vi.fn(async () => {
        throw new Error('translate failed');
      }),
      preloadingComplete: true,
      isInitialized: true,
      isProviderMounted: true,
    });

    render(
      <MemoryRouter>
        <DynamicTitle />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.title).toBe('Raíces | aprendizaje con IA para familias de Madrid');
    });
  });
});
