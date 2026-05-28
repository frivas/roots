import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockUseUser = vi.fn();
const mockSidebar = vi.fn(({ userRoles, hideBottomBorder }: { userRoles: string[]; hideBottomBorder: boolean }) => (
  <div
    data-testid="sidebar"
    data-roles={userRoles.join(',')}
    data-hide-border={String(hideBottomBorder)}
  />
));

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

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => mockUseUser(),
  useClerk: vi.fn(() => ({ signOut: vi.fn() })),
  UserButton: () => <div data-testid="user-btn" />,
}));

vi.mock('./SimpleHeader', () => ({
  default: () => <div data-testid="simple-header" />,
}));

vi.mock('./ModernSidebar', () => ({
  default: (props: { userRoles: string[]; hideBottomBorder: boolean }) => mockSidebar(props),
}));

vi.mock('./Footer', () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock('../ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../RouteWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../services/SpanishTranslations', () => ({
  getSpanishTranslation: vi.fn((text: string) => text),
}));

vi.mock('../../config/menuConfig', () => ({
  getMenuItems: vi.fn(() => []),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/home' })),
    Outlet: () => <div data-testid="outlet" />,
  };
});

import MainLayout from './MainLayout';
import { useLocation } from 'react-router-dom';

describe('MainLayout', () => {
  beforeEach(() => {
    mockUseUser.mockReset();
    mockSidebar.mockClear();
    mockUseUser.mockReturnValue({
      user: {
        publicMetadata: { roles: ['teacher'] },
        imageUrl: '',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        primaryEmailAddress: { emailAddress: 'test@example.com' },
      },
      isLoaded: true,
    });
  });

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders the sidebar', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the outlet', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('shows footer on non-ElevenLabs paths', () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('hides footer on ElevenLabs agent paths like /services/storytelling-session', () => {
    vi.mocked(useLocation).mockReturnValueOnce({
      pathname: '/services/storytelling-session',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('passes filtered user roles to the sidebar and hides the border on agent pages', () => {
    mockUseUser.mockReturnValue({
      user: {
        publicMetadata: { roles: ['teacher', 'invalid-role', 'administrator'] },
      },
      isLoaded: true,
    });

    vi.mocked(useLocation).mockReturnValueOnce({
      pathname: '/services/progress-interpretation-chat/session',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-roles', 'teacher,administrator');
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-hide-border', 'true');
  });

  it('passes no roles to the sidebar until Clerk is loaded', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
    });

    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-roles', '');
  });
});
