import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Bell, BookOpen, Calendar, Home, Mail, Megaphone, School, User } from 'lucide-react';

const mockSignOut = vi.fn();
const mockGetMenuItems = vi.fn();
const mockUseLocation = vi.fn();
const mockUseUser = vi.fn();

vi.mock('../TranslatedText', () => ({
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('../ui/MadridLogo', () => ({
  default: () => <div data-testid="madrid-logo" />,
}));

vi.mock('../../config/menuConfig', () => ({
  getMenuItems: (...args: unknown[]) => mockGetMenuItems(...args),
}));

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => mockUseUser(),
  useClerk: () => ({ signOut: mockSignOut }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useLocation: () => mockUseLocation(),
}));

import ModernSidebar from './ModernSidebar';
import type { Role } from '../../config/menuConfig';

const TestIcon = Home;
const testNavigation = [
  {
    name: 'Section',
    icon: TestIcon,
    children: [
      {
        name: 'Nested',
        icon: BookOpen,
        children: [
          { name: 'Leaf Link', href: '/nested/leaf', icon: Mail },
          { name: 'Leaf Static', icon: Bell },
        ],
      },
      { name: 'Direct Child', href: '/direct-child', icon: User },
      { name: 'Static Child', icon: School },
    ],
  },
  {
    name: 'Hybrid Section',
    href: '/hybrid',
    icon: Home,
    children: [
      { name: 'Hybrid Child', href: '/hybrid/child', icon: Mail },
    ],
  },
  { name: 'Top Link', href: '/top-link', icon: Calendar },
  { name: 'Top Static', icon: Megaphone },
];

const renderSidebar = (props: Partial<{ userRoles: Role[]; hideBottomBorder: boolean }> = {}) =>
  render(
    <ModernSidebar
      userRoles={props.userRoles ?? (['teacher'] as Role[])}
      hideBottomBorder={props.hideBottomBorder ?? false}
    />
  );

describe('ModernSidebar', () => {
  beforeEach(() => {
    mockSignOut.mockReset();
    mockGetMenuItems.mockReset();
    mockGetMenuItems.mockReturnValue(testNavigation);
    mockUseLocation.mockReset();
    mockUseLocation.mockReturnValue({ pathname: '/' });
    mockUseUser.mockReset();
    mockUseUser.mockReturnValue({
      user: {
        id: 'u1',
        imageUrl: '',
        firstName: 'Test',
        lastName: 'User',
        primaryEmailAddress: { emailAddress: 'test@example.com' },
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      },
    });
  });

  it('renders direct links, static items, branding, and sign out affordances', () => {
    renderSidebar();

    expect(screen.getByText('Raíces')).toBeInTheDocument();
    expect(screen.getByText('Top Link').closest('a')).toHaveAttribute('href', '/top-link');
    expect(screen.getByText('Top Static')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('auto-expands nested menus for active grandchild routes and renders static descendants', () => {
    mockUseLocation.mockReturnValue({ pathname: '/nested/leaf' });

    renderSidebar();

    expect(screen.getByText('Leaf Link').closest('a')).toHaveAttribute('href', '/nested/leaf');
    expect(screen.getByText('Leaf Static')).toBeInTheDocument();
    expect(screen.getByText('Static Child')).toBeInTheDocument();
  });

  it('toggles expandable menus and signs the user out', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    renderSidebar();

    fireEvent.click(screen.getByRole('button', { name: /section/i }));
    fireEvent.click(screen.getByRole('button', { name: /section/i }));
    fireEvent.click(screen.getByText('Sign Out'));

    expect(logSpy).toHaveBeenCalledWith('Expanded:', 'Section');
    expect(logSpy).toHaveBeenCalledWith('Collapsed:', 'Section');
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('toggles nested child menus and responds to hover expansion', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockUseLocation.mockReturnValue({ pathname: '/nested/leaf' });

    const { container } = renderSidebar();
    const root = container.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(root);
    fireEvent.click(screen.getByRole('button', { name: /nested/i }));
    fireEvent.mouseLeave(root);

    expect(logSpy).toHaveBeenCalledWith('Collapsed:', 'Nested');
  });

  it('renders user image avatars and respects the hideBottomBorder variant', () => {
    mockUseLocation.mockReturnValue({ pathname: '/top-link' });
    mockUseUser.mockReturnValue({
      user: {
        id: 'u2',
        imageUrl: 'https://img.test/avatar.png',
        firstName: 'Image',
        lastName: 'User',
        primaryEmailAddress: { emailAddress: 'image@example.com' },
        emailAddresses: [{ emailAddress: 'image@example.com' }],
      },
    });

    const { container } = renderSidebar({ hideBottomBorder: true });

    expect(screen.getByAltText('Image User')).toBeInTheDocument();
    expect(screen.getByText('Top Link').closest('a')?.className).toContain('bg-red-500/20');
    expect(container.querySelector('.border-t')).not.toBeInTheDocument();
  });

  it('marks hybrid items with href as active when their path matches', () => {
    mockUseLocation.mockReturnValue({ pathname: '/hybrid' });

    renderSidebar();

    expect(screen.getByText('Hybrid Section').closest('a')?.className).toContain('bg-red-500/20');
  });

  it('falls back to a generic user label when names are unavailable', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'u3',
        imageUrl: '',
        primaryEmailAddress: { emailAddress: 'fallback@example.com' },
        emailAddresses: [{ emailAddress: 'fallback@example.com' }],
      },
    });

    renderSidebar();

    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
