/**
 * Router test helpers.
 *
 * These are thin utilities for tests that need to inspect or drive navigation
 * without mounting a real browser router.
 */

/** Build a simple MemoryRouter initial-entries array for a single path. */
export const routeFor = (path: string): string[] => [path];

/** Extract the last pathname from the JSDOM location mock if using useNavigate spy. */
export const getLastNavigatedPath = (navigateSpy: ReturnType<typeof import('vitest').vi.fn>): string | undefined => {
  const calls = navigateSpy.mock.calls;
  if (calls.length === 0) return undefined;
  const lastArgs = calls[calls.length - 1];
  return typeof lastArgs[0] === 'string' ? lastArgs[0] : undefined;
};
