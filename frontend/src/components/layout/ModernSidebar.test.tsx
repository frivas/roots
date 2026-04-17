import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

type Role = 'student' | 'parent' | 'teacher' | 'administrator';

const mocks = vi.hoisted(() => {
  const MockIcon = () => null;

  return {
    pathname: '/home',
    signOut: vi.fn(),
    user: {
      id: 'u1',
      imageUrl: '',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    menuItems: [
      {
        name: 'Home',
        icon: MockIcon,
        children: [
          { name: 'Dashboard', href: '/dashboard', icon: MockIcon },
          {
            name: 'Group',
            icon: MockIcon,
            children: [
              { name: 'Nested Link', href: '/nested', icon: MockIcon },
              { name: 'Nested Label', icon: MockIcon },
            ],
          },
          { name: 'Placeholder', icon: MockIcon },
        ],
      },
      {
        name: 'Direct Item',
        href: '/direct',
        icon: MockIcon,
      },
    ] as Array<Record<string, unknown>>,
  };
});

vi.mock('../../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: 'en-US',
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: vi.fn(async (text: string) => text),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../services/SpanishTranslations', () => ({
  getSpanishTranslation: vi.fn((text: string) => text),
}));

vi.mock('../../config/menuConfig', () => ({
  getMenuItems: vi.fn(() => mocks.menuItems),
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(() => ({
    user: mocks.user,
  })),
  useClerk: vi.fn(() => ({ signOut: mocks.signOut })),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: mocks.pathname })),
    Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; className?: string }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

import ModernSidebar from './ModernSidebar';

const defaultProps = {
  userRoles: ['teacher'] as Role[],
};

const renderSidebar = (props?: Partial<React.ComponentProps<typeof ModernSidebar>>) =>
  render(
    <MemoryRouter>
      <ModernSidebar {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe('ModernSidebar', () => {
  beforeEach(() => {
    mocks.pathname = '/home';
    mocks.signOut.mockReset();
    mocks.user = {
      id: 'u1',
      imageUrl: '',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    };
    mocks.menuItems = [
      {
        name: 'Home',
        icon: (() => null) as () => null,
        children: [
          { name: 'Dashboard', href: '/dashboard', icon: (() => null) as () => null },
          {
            name: 'Group',
            icon: (() => null) as () => null,
            children: [
              { name: 'Nested Link', href: '/nested', icon: (() => null) as () => null },
              { name: 'Nested Label', icon: (() => null) as () => null },
            ],
          },
          { name: 'Placeholder', icon: (() => null) as () => null },
        ],
      },
      {
        name: 'Direct Item',
        href: '/direct',
        icon: (() => null) as () => null,
      },
    ];
  });

  it('renders without crashing for teacher role', () => {
    renderSidebar();
    expect(document.body).toBeTruthy();
  });

  it('renders without crashing for other role combinations', () => {
    renderSidebar({ userRoles: ['administrator'] as Role[] });
    renderSidebar({ userRoles: ['parent'] as Role[] });
    renderSidebar({ userRoles: ['student'] as Role[] });
    renderSidebar({ userRoles: [] });
    expect(document.body).toBeTruthy();
  });

  it('renders the sign out button and calls signOut when clicked', () => {
    renderSidebar();

    fireEvent.click(screen.getByText('Sign Out'));

    expect(mocks.signOut).toHaveBeenCalled();
  });

  it('renders the Raices brand link', () => {
    renderSidebar();
    expect(screen.getByText('Raíces')).toBeInTheDocument();
  });

  it('auto-expands nested menus for the active route', async () => {
    mocks.pathname = '/nested';

    renderSidebar();

    await waitFor(() => expect(screen.getByText('Nested Link')).toBeInTheDocument());
    expect(screen.getByText('Nested Label')).toBeInTheDocument();
  });

  it('toggles top-level and nested menus when clicked', async () => {
    renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Nested Link')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Group' }));
    expect(await screen.findByText('Nested Link')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Group' }));
    await waitFor(() => expect(screen.queryByText('Nested Link')).not.toBeInTheDocument());
  });

  it('renders placeholder child items without links', async () => {
    renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: 'Home' }));

    const placeholder = await screen.findByText('Placeholder');
    expect(placeholder.closest('a')).toBeNull();
  });

  it('marks direct links as active when the route matches', () => {
    mocks.pathname = '/direct';

    renderSidebar();

    expect(screen.getByRole('link', { name: 'Direct Item' }).className).toContain('bg-red-500/20');
  });

  it('updates the mobile state on hover', () => {
    const { container } = renderSidebar();
    const sidebar = container.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(sidebar);
    expect(sidebar.className).toContain('w-72');

    fireEvent.mouseLeave(sidebar);
    expect(sidebar.className).toContain('w-16');
  });

  it('renders the user avatar image when one exists', () => {
    mocks.user = {
      ...mocks.user,
      imageUrl: 'https://example.com/avatar.png',
    };

    renderSidebar();

    expect(screen.getByAltText('Test User')).toBeInTheDocument();
  });

  it('falls back to the email initial and translated user label when profile details are missing', () => {
    mocks.user = {
      id: 'u2',
      imageUrl: '',
      firstName: '',
      lastName: '',
      primaryEmailAddress: { emailAddress: 'alpha@example.com' },
      emailAddresses: [{ emailAddress: 'alpha@example.com' }],
    };

    renderSidebar();

    expect(screen.getByText('a')).toBeInTheDocument();
    const profileSection = screen.getByText('alpha@example.com').closest('div');
    if (!profileSection) {
      throw new Error('Expected profile section');
    }
    expect(within(profileSection.parentElement as HTMLElement).getByText('User')).toBeInTheDocument();
  });

  it('removes the bottom border when hideBottomBorder is enabled', () => {
    const { container } = renderSidebar({ hideBottomBorder: true });
    const footer = container.querySelector('button')?.closest('div')?.parentElement;

    expect(footer?.className).not.toContain('border-t');
  });
});
