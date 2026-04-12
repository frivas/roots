import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

const mockSignOut = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 'u1',
      imageUrl: '',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  })),
  useClerk: vi.fn(() => ({ signOut: mockSignOut })),
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

import ModernSidebar from './ModernSidebar';
import type { Role } from '../../config/menuConfig';

const defaultProps = {
  userRoles: ['teacher'] as Role[],
};

describe('ModernSidebar', () => {
  it('renders without crashing for teacher role', () => {
    render(
      <MemoryRouter>
        <ModernSidebar {...defaultProps} />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders without crashing for admin role', () => {
    render(
      <MemoryRouter>
        <ModernSidebar userRoles={['administrator'] as Role[]} />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders without crashing for parent role', () => {
    render(
      <MemoryRouter>
        <ModernSidebar userRoles={['parent'] as Role[]} />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders without crashing for student role', () => {
    render(
      <MemoryRouter>
        <ModernSidebar userRoles={['student'] as Role[]} />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders without crashing with no roles', () => {
    render(
      <MemoryRouter>
        <ModernSidebar userRoles={[]} />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders the Sign Out button', () => {
    render(
      <MemoryRouter>
        <ModernSidebar {...defaultProps} />
      </MemoryRouter>
    );
    // Sign Out button is in the sidebar
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls signOut when sign out button is clicked', () => {
    render(
      <MemoryRouter>
        <ModernSidebar {...defaultProps} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('renders the Raices brand link', () => {
    render(
      <MemoryRouter>
        <ModernSidebar {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Raíces')).toBeInTheDocument();
  });
});
