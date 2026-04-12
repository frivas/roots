import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

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
});
