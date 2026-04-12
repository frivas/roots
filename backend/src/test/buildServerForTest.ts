/**
 * Thin wrapper so tests don't re-implement buildServer() wiring.
 *
 * NOTE: requires the Phase 2 refactor that extracts `buildServer()` from
 * backend/src/index.ts.  Before that refactor this helper will throw at
 * runtime (the function doesn't exist yet on the module), but it compiles
 * and is safe to import.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildTestServer = async (opts?: any): Promise<any> => {
  // Dynamic import so tests that don't call this helper never trigger the
  // side-effect-heavy index module.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import('../index.js')) as any;
  if (typeof mod.buildServer !== 'function') {
    throw new Error(
      'buildTestServer: index.ts does not export buildServer() yet. ' +
      'Apply the Phase 2 refactor first.'
    );
  }
  return mod.buildServer(opts);
};
