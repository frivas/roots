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

import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  it('renders children inside the layout', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div data-testid="auth-child">Sign In Form</div>
        </AuthLayout>
      </MemoryRouter>
    );
    expect(screen.getByTestId('auth-child')).toBeInTheDocument();
    expect(screen.getByText('Sign In Form')).toBeInTheDocument();
  });

  it('renders MadridLogo in the desktop column', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthLayout>
          <div>Child</div>
        </AuthLayout>
      </MemoryRouter>
    );
    // MadridLogo renders SVG stars - check at least one is present
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders an external link (Data Protection)', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Child</div>
        </AuthLayout>
      </MemoryRouter>
    );
    const externalLink = screen.getByRole('link', { name: /Data Protection/i });
    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute('href', 'https://www.comunidad.madrid/protecciondedatos');
  });

  it('renders a language switcher button', () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <div>Child</div>
        </AuthLayout>
      </MemoryRouter>
    );
    // LanguageSwitcher renders a button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('applies custom className to root div', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthLayout className="custom-auth">
          <div>Child</div>
        </AuthLayout>
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass('custom-auth');
  });
});
