import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  userId: 'user_1' as string | null,
  sessionId: 'session_1' as string | null,
}));

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: authState.userId,
    sessionId: authState.sessionId,
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

import { buildServer } from '../index.js';
import { createInMemoryBackendDependencies } from '../test/inMemoryBackend.js';

describe('images routes', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
  });

  it('returns a durable 202 job and completes it asynchronously', async () => {
    const harness = createInMemoryBackendDependencies();
    harness.dependencies.illustrationProvider = {
      generate: vi.fn(async () => 'https://img.test/job.png'),
    };
    const app = await buildServer({ dependencies: harness.dependencies });
    const queued = await app.inject({
      method: 'POST',
      url: '/api/images/generate-for-story',
      headers: { 'idempotency-key': 'turn_1' },
      payload: { prompt: 'A cheerful forest scene' },
    });

    expect(queued.statusCode).toBe(202);
    expect(queued.json()).toMatchObject({
      jobId: expect.any(String),
      status: 'pending',
      statusUrl: expect.any(String),
    });

    await harness.drainIllustrationJobs();
    const completed = await app.inject({
      method: 'GET',
      url: queued.json().statusUrl,
    });
    expect(completed.json()).toMatchObject({
      status: 'completed',
      imageUrl: 'https://img.test/job.png',
    });
  });

  it('deduplicates retries and rejects cross-user job reads', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });
    const request = {
      method: 'POST' as const,
      url: '/api/images/generate',
      headers: { 'idempotency-key': 'turn_1' },
      payload: { prompt: 'A safe scene' },
    };
    const first = await app.inject(request);
    const retry = await app.inject(request);
    authState.userId = 'user_2';
    authState.sessionId = 'session_2';
    const hidden = await app.inject({
      method: 'GET',
      url: first.json().statusUrl,
    });

    expect(retry.json().jobId).toBe(first.json().jobId);
    expect(hidden.statusCode).toBe(404);
  });

  it('rejects unauthenticated and oversized requests before provider work', async () => {
    const harness = createInMemoryBackendDependencies();
    const generate = vi.fn(async () => 'https://img.test/job.png');
    harness.dependencies.illustrationProvider = { generate };
    const app = await buildServer({ dependencies: harness.dependencies });

    const oversized = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: { prompt: 'x'.repeat(4_001) },
    });
    authState.userId = null;
    authState.sessionId = null;
    const unauthenticated = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: { prompt: 'A safe scene' },
    });

    expect(oversized.statusCode).toBe(400);
    expect(unauthenticated.statusCode).toBe(401);
    expect(generate).not.toHaveBeenCalled();
  });

  it('stores only an opaque failure code when the provider fails', async () => {
    const harness = createInMemoryBackendDependencies();
    harness.dependencies.illustrationProvider = {
      async generate() {
        throw new Error('vendor-secret-detail');
      },
    };
    const app = await buildServer({ dependencies: harness.dependencies });
    const queued = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: { prompt: 'A safe scene' },
    });
    await harness.drainIllustrationJobs();
    const failed = await app.inject({
      method: 'GET',
      url: queued.json().statusUrl,
    });

    expect(failed.json()).toMatchObject({
      status: 'failed',
      errorCode: 'IMAGE_GENERATION_FAILED',
    });
    expect(failed.body).not.toContain('vendor-secret-detail');
  });
});
