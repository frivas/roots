import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LingoTranslationProvider } from '../contexts/LingoTranslationContext';
import ClerkRuntimeBoundary from './ClerkRuntimeBoundary';

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: () => {
    throw new Error('invalid publishable key');
  },
}));

describe('ClerkRuntimeBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
      screen.getAllByRole('button', { name: 'Change language to Spanish' }),
    ).not.toHaveLength(0);
  });
});
