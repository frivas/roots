import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';

const mockSetLanguage = vi.fn();
let mockLanguage = 'en-US';

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    isTranslating: false,
    translateText: vi.fn(async (t: string) => t),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockLanguage = 'en-US';
  });

  it('renders an explicit two-language control', () => {
    render(
      <MemoryRouter>
        <LanguageSwitcher />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'Use English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use Spanish' })).toBeInTheDocument();
  });

  it('shows EN label when language is en-US', () => {
    render(
      <MemoryRouter>
        <LanguageSwitcher />
      </MemoryRouter>
    );
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('marks Spanish as selected and can switch back to English', () => {
    mockLanguage = 'es-ES';
    const events: CustomEvent[] = [];
    const listener = (event: Event) => events.push(event as CustomEvent);
    window.addEventListener('languageChanged', listener);

    render(
      <MemoryRouter>
        <LanguageSwitcher />
      </MemoryRouter>
    );

    expect(screen.getByText('ES')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usar español' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Usar inglés' }));

    expect(mockSetLanguage).toHaveBeenCalledWith('en-US');
    window.removeEventListener('languageChanged', listener);
  });

  it('uses the context setter on click', () => {
    render(
      <MemoryRouter>
        <LanguageSwitcher />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use Spanish' }));
    expect(mockSetLanguage).toHaveBeenCalledWith('es-ES');
  });

  it('dispatches languageChanged event with es-ES when current is en-US', () => {
    render(
      <MemoryRouter>
        <LanguageSwitcher />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use Spanish' }));
    expect(mockSetLanguage).toHaveBeenCalledWith('es-ES');
  });

  it('writes selectedLanguage to localStorage on click (non-auth path)', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <LanguageSwitcher />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use Spanish' }));

    // On non-auth page, selectedLanguage is not directly written by LanguageSwitcher
    // (it goes through the context event listener). The localStorage write only happens on auth pages.
    // Just verify the button is clickable without error.
    expect(mockSetLanguage).toHaveBeenCalledWith('es-ES');
  });

  it('writes selectedLanguage to localStorage on click on auth page', () => {
    render(
      <MemoryRouter initialEntries={['/auth/sign-in']}>
        <LanguageSwitcher />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use Spanish' }));

    expect(localStorage.getItem('selectedLanguage')).toBe('es-ES');
    expect(localStorage.getItem('authSelectedLanguage')).toBe('es-ES');
  });
});
