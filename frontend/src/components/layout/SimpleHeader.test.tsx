import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { getMenuItems } from '../../config/menuConfig';

const mockUseLocation = vi.fn(() => ({ pathname: '/home' }));

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

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; className?: string; onClick?: () => void }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
  };
});

import SimpleHeader from './SimpleHeader';

describe('SimpleHeader', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/home' });
  });
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

  it('keeps the language control visible in the signed-in mobile header', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument();
  });

  it('closes the mobile drawer with Escape and restores focus to its toggle', async () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(toggle);
    await waitFor(() => expect(screen.getByRole('link', { name: 'AI services overview' })).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('link', { name: 'Tutoring' })).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('wraps focus inside the open mobile drawer', async () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /open main menu/i }));
    const signOut = await screen.findByRole('button', { name: /sign out/i });
    signOut.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getByRole('link', { name: 'AI services overview' })).toHaveFocus();
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

  it('highlights the canonical destination for a nested route', () => {
    mockUseLocation.mockReturnValue({ pathname: '/communications/messages/thread-1' });
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /open main menu/i }));

    expect(screen.getByRole('link', { name: 'Messages' })).toHaveAttribute('aria-current', 'page');
  });

  it('closes mobile menu when a navigation link is clicked', () => {
    render(
      <MemoryRouter>
        <SimpleHeader />
      </MemoryRouter>
    );

    // Open the menu
    fireEvent.click(screen.getByRole('button', { name: /open main menu/i }));
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
