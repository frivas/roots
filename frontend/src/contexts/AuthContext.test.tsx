import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const navigateSpy = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: vi.fn(async () => 'fake-token'),
  })),
  useUser: vi.fn(() => ({
    user: {
      id: 'u1',
      primaryEmailAddress: { emailAddress: 'u@test.com' },
      publicMetadata: { role: 'teacher' },
    },
  })),
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => navigateSpy,
  useLocation: () => ({ pathname: '/home' }),
}));

import { AuthProvider, useAuth } from './AuthContext';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

const renderAuthProvider = (children: React.ReactNode = <div data-testid="child">ok</div>) =>
  render(
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );

describe('AuthProvider', () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    window.localStorage.clear();
    vi.mocked(useClerkAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn(async () => 'fake-token'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children when authenticated', () => {
    renderAuthProvider();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('does not redirect when signed in', () => {
    renderAuthProvider();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('redirects to /auth/login when signed out and not on /auth path', async () => {
    vi.mocked(useClerkAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      getToken: vi.fn(async () => null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    renderAuthProvider();
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith('/auth/login'));
  });

  it('dispatches languageChanged after 500ms when authSelectedLanguage is set', async () => {
    window.localStorage.setItem('authSelectedLanguage', 'es-ES');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    renderAuthProvider();
    // Wait up to 1500ms for the 500ms setTimeout + execution overhead
    await waitFor(
      () =>
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'languageChanged' })
        ),
      { timeout: 1500 }
    );
  });

  it('exposes isAuthenticated as true when signed in', () => {
    const Consumer = () => {
      const auth = useAuth();
      return <span data-testid="auth">{String(auth.isAuthenticated)}</span>;
    };
    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('auth').textContent).toBe('true');
  });

  it('exposes userId from the Clerk user', () => {
    const Consumer = () => {
      const auth = useAuth();
      return <span data-testid="uid">{auth.userId}</span>;
    };
    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('uid').textContent).toBe('u1');
  });

  it('exposes userRole from publicMetadata', () => {
    const Consumer = () => {
      const auth = useAuth();
      return <span data-testid="role">{auth.userRole}</span>;
    };
    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('role').textContent).toBe('teacher');
  });

  it('falls back to user role and null email when Clerk metadata is missing', () => {
    vi.mocked(useUser).mockReturnValueOnce({
      user: {
        id: 'u2',
        publicMetadata: {},
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const Consumer = () => {
      const auth = useAuth();
      return (
        <>
          <span data-testid="role">{auth.userRole}</span>
          <span data-testid="email">{String(auth.userEmail)}</span>
        </>
      );
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('role').textContent).toBe('user');
    expect(screen.getByTestId('email').textContent).toBe('null');
  });

  it('exposes isLoading while Clerk auth is not loaded yet', () => {
    vi.mocked(useClerkAuth).mockReturnValueOnce({
      isLoaded: false,
      isSignedIn: false,
      getToken: vi.fn(async () => null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const Consumer = () => {
      const auth = useAuth();
      return <span data-testid="loading">{String(auth.isLoading)}</span>;
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('returns null from getToken when Clerk token retrieval fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(useClerkAuth).mockReturnValueOnce({
      isLoaded: true,
      isSignedIn: true,
      getToken: vi.fn(async () => {
        throw new Error('token failed');
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const Consumer = () => {
      const auth = useAuth();
      const [token, setToken] = React.useState('unset');
      return (
        <>
          <span data-testid="token">{token}</span>
          <button data-testid="get-token" onClick={async () => setToken(String(await auth.getToken()))}>
            get-token
          </button>
        </>
      );
    };

    render(
      <MemoryRouter>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('get-token'));

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('null'));
    expect(errorSpy).toHaveBeenCalledWith('Failed to get token:', expect.any(Error));
  });

  it('ignores invalid authSelectedLanguage values after sign-in', async () => {
    vi.useFakeTimers();
    window.localStorage.setItem('authSelectedLanguage', 'fr-FR');

    renderAuthProvider();

    vi.advanceTimersByTime(600);

    expect(window.localStorage.getItem('selectedLanguage')).toBeNull();
    expect(window.localStorage.getItem('authSelectedLanguage')).toBe('fr-FR');
  });
});

describe('useAuth outside provider', () => {
  it('throws an error', () => {
    const Bad = () => { useAuth(); return null; };
    expect(() => render(<MemoryRouter><Bad /></MemoryRouter>)).toThrow();
  });
});
