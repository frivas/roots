import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders children immediately when lingo is initialized and preloaded', () => {
    render(
      <RouteWrapper>
        <div>Page Content</div>
      </RouteWrapper>
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
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

});
