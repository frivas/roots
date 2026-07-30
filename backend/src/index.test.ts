import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: 'user_1',
    sessionId: 'session_1',
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

import { buildServer, validateEnv } from './index.js';
import { createInMemoryBackendDependencies } from './test/inMemoryBackend.js';

describe('buildServer', () => {
  it('serves minimal liveness and dependency readiness endpoints', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    expect(
      (await app.inject({ method: 'GET', url: '/health' })).json(),
    ).toEqual({ status: 'ok' });
    expect(
      (await app.inject({ method: 'GET', url: '/ready' })).json(),
    ).toMatchObject({ status: 'ready' });
  });

  it('does not expose removed diagnostic endpoints', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    expect(
      (await app.inject({ method: 'GET', url: '/webhook/test' })).statusCode,
    ).toBe(404);
    expect(
      (await app.inject({ method: 'GET', url: '/api/images/test' })).statusCode,
    ).toBe(404);
  });

  it('requires PORT only for the standalone listener', () => {
    const env = {
      CLERK_PUBLISHABLE_KEY: 'pk_test',
      CLERK_SECRET_KEY: 'sk_test',
      FRONTEND_URL: 'https://frontend.test',
    } as NodeJS.ProcessEnv;

    expect(() =>
      validateEnv(env, { standalone: false, injectedDependencies: true }),
    ).not.toThrow();
    expect(() =>
      validateEnv(env, { standalone: true, injectedDependencies: true }),
    ).toThrow('Missing required environment variable: PORT');
  });
});
