import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInMemoryBackendDependencies } from './test/inMemoryBackend.js';
import { EventEmitter } from 'node:events';
import type { FastifyInstance } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';

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

  it(
    'cold-starts without PORT and serves the shared Fastify app',
    async () => {
      delete process.env.PORT;
      const adapter = await import('./serverless-app.js');
      const harness = createInMemoryBackendDependencies();

      const app = await adapter.getServerlessApp({
        dependencies: harness.dependencies,
      });
      const response = await app.inject({ method: 'GET', url: '/ready' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ status: 'ready' });
    },
    15_000,
  );

  it('waits until the platform response has finished', async () => {
    const adapter = await import('./serverless-app.js');
    const response = new EventEmitter() as ServerResponse;
    const server = {
      emit: vi.fn((_event, _request, emittedResponse: EventEmitter) => {
        queueMicrotask(() => emittedResponse.emit('finish'));
      }),
    };
    const fastify = { server } as unknown as FastifyInstance;

    await expect(
      adapter.dispatchServerlessRequest(
        fastify,
        {} as IncomingMessage,
        response,
      ),
    ).resolves.toBeUndefined();
    expect(server.emit).toHaveBeenCalledWith(
      'request',
      expect.anything(),
      response,
    );
  });

  it('shares one in-flight application build across concurrent cold starts', async () => {
    const adapter = await import('./serverless-app.js');
    const harness = createInMemoryBackendDependencies();

    const [first, second] = await Promise.all([
      adapter.getServerlessApp({ dependencies: harness.dependencies }),
      adapter.getServerlessApp({ dependencies: harness.dependencies }),
    ]);

    expect(first).toBe(second);
  });
});
