/**
 * Shared render helper for component tests.
 *
 * USAGE NOTES
 * -----------
 * 1. Mock @clerk/clerk-react at the TOP of each test file (Vitest hoists vi.mock):
 *      installClerkReactMock(mockClerkUser())   // signed-in
 *      installClerkReactMock(null)              // signed-out
 *
 * 2. Mock LingoTranslationService before importing any component that triggers
 *    LingoTranslationContext:
 *      vi.mock('../services/LingoTranslationService', () => ({
 *        lingoTranslationService: {
 *          translateText: vi.fn(async (t) => t),
 *          clearCache: vi.fn(),
 *          preloadCommonTranslations: vi.fn(async () => {}),
 *          getStats: vi.fn(() => ({ size: 0 })),
 *        },
 *      }))
 *
 * 3. Because LingoTranslationProvider has an async init effect with a 200 ms
 *    delay, use vi.useFakeTimers() + vi.advanceTimersByTime(250) + waitFor()
 *    to reach the fully-initialized state before asserting on children.
 */

import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LingoTranslationProvider } from '../contexts/LingoTranslationContext';

export interface RenderOptions {
  /** Initial route path, e.g. '/home'. Defaults to '/'. */
  route?: string;
  /** Pre-seed localStorage selectedLanguage. Defaults to 'en-US'. */
  language?: 'en-US' | 'es-ES';
}

export const renderWithProviders = (
  ui: React.ReactElement,
  opts: RenderOptions = {}
): RenderResult => {
  const { route = '/', language = 'en-US' } = opts;

  // Seed localStorage BEFORE mounting LingoTranslationProvider so its
  // useState initializer reads the correct language.
  window.localStorage.setItem('selectedLanguage', language);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <LingoTranslationProvider>{ui}</LingoTranslationProvider>
    </MemoryRouter>
  );
};

/**
 * Minimal router-only wrapper — for components that don't need the Lingo
 * context at all (e.g. pure presentational components).
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/' }: Pick<RenderOptions, 'route'> = {}
): RenderResult => {
  return render(
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
  );
};
