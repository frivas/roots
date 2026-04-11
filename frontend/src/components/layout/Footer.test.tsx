import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: 'en-US',
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: vi.fn(async (t: string) => t),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../services/SpanishTranslations', () => ({
  getSpanishTranslation: vi.fn((text: string) => text),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/home' })),
    Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; className?: string }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

import Footer from './Footer';
import { useLocation } from 'react-router-dom';

describe('Footer', () => {
  it('renders copyright with the current year', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('renders privacy policy link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders terms of service link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('renders cookie policy link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
  });

  it('renders external data protection link', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Data Protection')).toBeInTheDocument();
  });

  it('hides AI disclaimer on /home path', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.queryByText('AI-Powered Service Notice')).not.toBeInTheDocument();
  });

  it('shows AI disclaimer on /services/storytelling-session path', () => {
    vi.mocked(useLocation).mockReturnValueOnce({
      pathname: '/services/storytelling-session',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('AI-Powered Service Notice')).toBeInTheDocument();
  });

  it('shows AI disclaimer on /services/math-tutoring-session path', () => {
    vi.mocked(useLocation).mockReturnValueOnce({
      pathname: '/services/math-tutoring-session',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('AI-Powered Service Notice')).toBeInTheDocument();
  });

  it('renders a footer element', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
