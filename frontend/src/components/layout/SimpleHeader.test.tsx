import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { getMenuItems } from '../../config/menuConfig';

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
      firstName: 'Test',
      fullName: 'Test User',
      imageUrl: '',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
  })),
  useClerk: vi.fn(() => ({ signOut: mockSignOut })),
  UserButton: () => <div data-testid="user-btn" />,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/home' })),
    Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; className?: string; onClick?: () => void }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

import SimpleHeader from './SimpleHeader';

describe('SimpleHeader', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders the brand name', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );
    expect(screen.getByText('Raíces')).toBeInTheDocument();
  });

  it('opens mobile menu when toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    // Before clicking, menu items should not be visible
    expect(screen.queryByText('Home')).not.toBeInTheDocument();

    // Click the menu toggle button
    const toggle = screen.getByRole('button', { name: /open main menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);

    // After clicking, navigation items should appear
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('uses the same registered destination model as the desktop sidebar', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /open main menu/i }));

    const expectedDestinations = getMenuItems([], 'test@example.com')
      .flatMap(group => group.children ?? [])
      .flatMap(item => item.href ? [item.href] : []);
    const renderedDestinations = screen.getAllByRole('link')
      .map(link => link.getAttribute('href'))
      .filter(Boolean);

    expect(renderedDestinations).toEqual(expect.arrayContaining(expectedDestinations));
    expect(renderedDestinations).not.toContain('/messages');
    expect(renderedDestinations).not.toContain('/settings');
  });

  it('closes mobile menu when a navigation link is clicked', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    // Open the menu
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Home')).toBeInTheDocument();

    // Click a navigation link
    fireEvent.click(screen.getByRole('link', { name: 'Tutoring' }));

    // Menu should be closed
    expect(screen.queryByRole('link', { name: 'Tutoring' })).not.toBeInTheDocument();
  });

  it('renders header element', () => {
    const { container } = render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('signs the user out from the mobile menu and closes it', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /open main menu/i }));
    fireEvent.click(screen.getByText('Sign out'));

    expect(mockSignOut).toHaveBeenCalled();
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
  });
});
