import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../contexts/LingoTranslationContext', () => ({
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

vi.mock('@clerk/clerk-react', () => ({
  SignIn: ({ routing, forceRedirectUrl, path }: { routing?: string; forceRedirectUrl?: string; path?: string }) => (
    <div
      data-testid="clerk-signin"
      data-routing={routing}
      data-redirect={forceRedirectUrl}
      data-path={path}
    />
  ),
  SignUp: ({ routing, forceRedirectUrl, path }: { routing?: string; forceRedirectUrl?: string; path?: string }) => (
    <div
      data-testid="clerk-signup"
      data-routing={routing}
      data-redirect={forceRedirectUrl}
      data-path={path}
    />
  ),
}));

vi.mock('../hooks/useClerkLocalization', () => ({
  default: vi.fn(),
}));

import ClerkAuthWrapper from './ClerkAuthWrapper';

describe('ClerkAuthWrapper', () => {
  it('renders SignIn for type=signIn', () => {
    render(<ClerkAuthWrapper type="signIn" forceRedirectUrl="/home" />);
    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
  });

  it('renders SignUp for type=signUp', () => {
    render(<ClerkAuthWrapper type="signUp" forceRedirectUrl="/home" />);
    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
  });

  it('passes forceRedirectUrl to SignIn component', () => {
    render(<ClerkAuthWrapper type="signIn" forceRedirectUrl="/dashboard" />);
    expect(screen.getByTestId('clerk-signin')).toHaveAttribute('data-redirect', '/dashboard');
  });

  it('passes forceRedirectUrl to SignUp component', () => {
    render(<ClerkAuthWrapper type="signUp" forceRedirectUrl="/onboarding" />);
    expect(screen.getByTestId('clerk-signup')).toHaveAttribute('data-redirect', '/onboarding');
  });

  it('renders SignIn with path routing when routing=path and path provided', () => {
    render(
      <ClerkAuthWrapper
        type="signIn"
        routing="path"
        path="/auth/sign-in"
        forceRedirectUrl="/home"
      />
    );
    const el = screen.getByTestId('clerk-signin');
    expect(el).toHaveAttribute('data-routing', 'path');
    expect(el).toHaveAttribute('data-path', '/auth/sign-in');
  });

  it('renders SignIn with virtual routing by default', () => {
    render(<ClerkAuthWrapper type="signIn" forceRedirectUrl="/home" />);
    expect(screen.getByTestId('clerk-signin')).toHaveAttribute('data-routing', 'virtual');
  });

  it('renders SignUp with path routing when routing=path and path provided', () => {
    render(
      <ClerkAuthWrapper
        type="signUp"
        routing="path"
        path="/auth/sign-up"
        forceRedirectUrl="/home"
      />
    );
    const el = screen.getByTestId('clerk-signup');
    expect(el).toHaveAttribute('data-routing', 'path');
    expect(el).toHaveAttribute('data-path', '/auth/sign-up');
  });
});
