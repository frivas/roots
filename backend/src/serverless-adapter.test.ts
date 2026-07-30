import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInMemoryBackendDependencies } from './test/inMemoryBackend.js';

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: 'serverless_user',
    sessionId: 'serverless_session',
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

describe('Vercel serverless adapter', () => {
  const originalPort = process.env.PORT;

  afterEach(async () => {
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
    const adapter = await import('./serverless-app.js');
    await adapter.resetServerlessAppForTests();
  });

  it('cold-starts without PORT and serves the shared Fastify app', async () => {
    delete process.env.PORT;
    const adapter = await import('./serverless-app.js');
    const harness = createInMemoryBackendDependencies();

    const app = await adapter.getServerlessApp({
      dependencies: harness.dependencies,
    });
    const response = await app.inject({ method: 'GET', url: '/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ready' });
  });
});
