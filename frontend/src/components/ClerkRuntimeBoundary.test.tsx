import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LingoTranslationProvider } from '../contexts/LingoTranslationContext';
import ClerkRuntimeBoundary from './ClerkRuntimeBoundary';

const clerkMock = vi.hoisted(() => ({
  shouldThrow: true,
  localization: undefined as unknown,
}));

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children, localization }: { children: React.ReactNode; localization?: unknown }) => {
    clerkMock.localization = localization;
    if (clerkMock.shouldThrow) throw new Error('invalid publishable key');
    return children;
  },
}));

describe('ClerkRuntimeBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clerkMock.shouldThrow = true;
    clerkMock.localization = undefined;
    localStorage.clear();
  });

  it('keeps the public auth shell available when Clerk cannot initialize', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <LingoTranslationProvider>
        <MemoryRouter initialEntries={['/auth/login']}>
          <ClerkRuntimeBoundary publishableKey="">
            <div>authenticated application</div>
          </ClerkRuntimeBoundary>
        </MemoryRouter>
      </LingoTranslationProvider>,
    );

    expect(
      screen.getAllByRole('heading', { name: 'Raíces' }),
    ).not.toHaveLength(0);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Authentication is temporarily unavailable',
    );
    expect(
      screen.getAllByRole('button', { name: 'Use Spanish' }),
    ).not.toHaveLength(0);
  });

  it('passes Spanish localization through Clerk instead of mutating its DOM', () => {
    clerkMock.shouldThrow = false;
    localStorage.setItem('selectedLanguage', 'es-ES');

    render(
      <LingoTranslationProvider>
        <MemoryRouter>
          <ClerkRuntimeBoundary publishableKey="test_key">
            <div>application</div>
          </ClerkRuntimeBoundary>
        </MemoryRouter>
      </LingoTranslationProvider>,
    );

    expect(clerkMock.localization).toMatchObject({
      signIn: { start: { title: 'Iniciar sesión' } },
      formFieldLabel__password: 'Contraseña',
    });
  });
});
