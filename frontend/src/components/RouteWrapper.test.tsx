import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

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

import RouteWrapper from './RouteWrapper';

describe('RouteWrapper', () => {
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

  it('renders children when lingo is initialized and preloaded', async () => {
    render(
      <RouteWrapper>
        <div>Page Content</div>
      </RouteWrapper>
    );
    // The component uses a 50ms timer before showing content
    await waitFor(
      () => expect(screen.getByText('Page Content')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('shows a loading state (spinner) initially', () => {
    render(
      <RouteWrapper>
        <div>Page Content</div>
      </RouteWrapper>
    );
    // Before the 50ms timer fires, the spinner shows "Loading..." text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows spinner when lingo is not yet initialized', () => {
    mockUseLingoTranslation.mockReturnValueOnce({
      language: 'en-US',
      setLanguage: vi.fn(),
      isTranslating: false,
      translateText: vi.fn(async (t: string) => t),
      preloadingComplete: false,
      isInitialized: false,
      isProviderMounted: false,
    });

    render(
      <RouteWrapper>
        <div>Page Content</div>
      </RouteWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('falls back to ready after the long timeout even if initialization never completes', async () => {
    mockUseLingoTranslation.mockReturnValueOnce({
      language: 'en-US',
      setLanguage: vi.fn(),
      isTranslating: false,
      translateText: vi.fn(async (t: string) => t),
      preloadingComplete: false,
      isInitialized: false,
      isProviderMounted: false,
    });

    render(
      <RouteWrapper>
        <div>Fallback Content</div>
      </RouteWrapper>
    );

    await new Promise((resolve) => setTimeout(resolve, 2100));

    await waitFor(() => expect(screen.getByText('Fallback Content')).toBeInTheDocument());
  });
});
