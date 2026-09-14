import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: 'user_1',
    sessionId: 'session_1',
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

import { buildServer, getRuntimeMode, validateEnv } from './index.js';
import { createInMemoryBackendDependencies } from './test/inMemoryBackend.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildServer', () => {
  it('serves minimal liveness and dependency readiness endpoints', async () => {
    const releaseSha = 'a'.repeat(40);
    vi.stubEnv('RELEASE_SHA', releaseSha);
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    expect(
      (await app.inject({ method: 'GET', url: '/health' })).json(),
    ).toEqual({ status: 'ok', mode: 'connected', releaseSha });
    expect(
      (await app.inject({ method: 'GET', url: '/ready' })).json(),
    ).toMatchObject({ status: 'ready' });
  });

  it('defaults production configuration to honest demo mode', () => {
    expect(getRuntimeMode({} as NodeJS.ProcessEnv)).toBe('demo');
    expect(
      getRuntimeMode({ ROOTS_BACKEND_MODE: 'connected' } as NodeJS.ProcessEnv),
    ).toBe('connected');
    expect(() =>
      getRuntimeMode({ ROOTS_BACKEND_MODE: 'invalid' } as NodeJS.ProcessEnv),
    ).toThrow('ROOTS_BACKEND_MODE must be demo or connected');
  });

  it('does not require data or paid-provider configuration in demo mode', () => {
    const env = {
      NODE_ENV: 'production',
      RELEASE_SHA: 'a'.repeat(40),
      CLERK_PUBLISHABLE_KEY: 'pk_test',
      CLERK_SECRET_KEY: 'sk_test',
      FRONTEND_URL: 'https://frontend.test',
    } as NodeJS.ProcessEnv;

    expect(() => validateEnv(env)).not.toThrow();
    expect(() =>
      validateEnv({ ...env, ROOTS_BACKEND_MODE: 'connected' }),
    ).toThrow('Missing required environment variable: SUPABASE_URL');
  });

  it('returns a generated correlation ID without trusting inbound IDs', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { 'x-request-id': 'attacker-controlled' },
    });

    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(response.headers['x-request-id']).not.toBe('attacker-controlled');
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

  it('returns a stable error contract for unknown routes', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const response = await app.inject({ method: 'GET', url: '/missing' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'NOT_FOUND' });
  });

  it('requires PORT only for the standalone listener', () => {
    const env = {
      NODE_ENV: 'test',
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

  it('requires a valid immutable release SHA outside local and test', () => {
    const env = {
      NODE_ENV: 'production',
      CLERK_PUBLISHABLE_KEY: 'pk_test',
      CLERK_SECRET_KEY: 'sk_test',
      FRONTEND_URL: 'https://frontend.test',
    } as NodeJS.ProcessEnv;

    expect(() =>
      validateEnv(env, { injectedDependencies: true }),
    ).toThrow('Missing immutable release SHA');
    expect(() =>
      validateEnv(
        { ...env, RELEASE_SHA: 'not-a-sha' },
        { injectedDependencies: true },
      ),
    ).toThrow('Invalid immutable release SHA');
    expect(() =>
      validateEnv(
        { ...env, RELEASE_SHA: 'a'.repeat(40) },
        { injectedDependencies: true },
      ),
    ).not.toThrow();
  });
});
