import React from 'react';
import { vi } from 'vitest';

export type ClerkUserLike = {
  id?: string;
  primaryEmailAddress?: { emailAddress: string };
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, unknown>;
  emailAddresses?: Array<{ emailAddress: string }>;
};

export const mockClerkUser = (overrides?: Partial<ClerkUserLike>): ClerkUserLike => ({
  id: 'user_test_123',
  primaryEmailAddress: { emailAddress: 'test@example.com' },
  firstName: 'Test',
  lastName: 'User',
  imageUrl: '',
  publicMetadata: { roles: ['teacher'] },
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  ...overrides,
});

/**
 * Install a vi.mock for @clerk/clerk-react.
 * Call at the top level of a test file so Vitest can hoist it before imports.
 */
export const installClerkReactMock = (user?: ClerkUserLike | null) => {
  vi.mock('@clerk/clerk-react', () => ({
    useUser: () => ({ isLoaded: true, isSignedIn: !!user, user }),
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: !!user,
      getToken: vi.fn(async () => 'fake-token'),
    }),
    useClerk: () => ({ signOut: vi.fn() }),
    ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SignedIn: ({ children }: { children: React.ReactNode }) =>
      user ? <>{children}</> : null,
    SignedOut: ({ children }: { children: React.ReactNode }) =>
      user ? null : <>{children}</>,
    SignIn: () => <div data-testid="clerk-signin" />,
    SignUp: () => <div data-testid="clerk-signup" />,
    UserButton: () => <div data-testid="clerk-userbutton" />,
    RedirectToSignIn: () => <div data-testid="clerk-redirect" />,
  }));
};
