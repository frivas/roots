import { createHmac } from 'node:crypto';
import type { FastifyBaseLogger } from 'fastify';
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

import { buildServer } from './index.js';
import type { IllustrationJobRepository } from './repositories/contracts.js';
import { IllustrationJobService } from './services/illustration-jobs.js';
import { createInMemoryBackendDependencies } from './test/inMemoryBackend.js';

const signedHeaders = (rawBody: string, timestamp = Math.floor(Date.now() / 1_000)) => ({
  'content-type': 'application/json',
  'elevenlabs-signature': `t=${timestamp},v0=${createHmac(
    'sha256',
    process.env.ELEVENLABS_WEBHOOK_SECRET!,
  )
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')}`,
});

describe('security remediation contracts', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
  });

  it('splits liveness from dependency readiness', async () => {
    const harness = createInMemoryBackendDependencies();
    harness.dependencies.readiness = {
      async check() {
        return {
          ready: false,
          checks: {
            clerk: 'ok',
            openai: 'ok',
            supabase: 'unavailable',
          },
        };
      },
    };
    const app = await buildServer({ dependencies: harness.dependencies });

    const live = await app.inject({ method: 'GET', url: '/health' });
    const ready = await app.inject({ method: 'GET', url: '/ready' });

    expect(live.statusCode).toBe(200);
    expect(live.json()).toEqual({ status: 'ok', releaseSha: 'local' });
    expect(ready.statusCode).toBe(503);
    expect(ready.json()).toEqual({
      status: 'not_ready',
      checks: {
        clerk: 'ok',
        openai: 'ok',
        supabase: 'unavailable',
      },
    });
  });

  it('rejects unsigned webhook requests before enqueueing work', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });
    const rawBody = JSON.stringify({
      user_id: 'user_1',
      session_id: 'session_1',
      event_id: 'event_1',
      prompt: 'A safe woodland scene',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      headers: { 'content-type': 'application/json' },
      payload: rawBody,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'INVALID_WEBHOOK_SIGNATURE' });
    expect(harness.state.jobs.size).toBe(0);
  });

  it('accepts authentic webhook retries exactly once', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });
    const rawBody = JSON.stringify({
      user_id: 'user_1',
      session_id: 'session_1',
      event_id: 'event_1',
      prompt: 'A safe woodland scene',
    });
    const request = {
      method: 'POST' as const,
      url: '/webhook/elevenlabs/story-illustration',
      headers: signedHeaders(rawBody),
      payload: rawBody,
    };

    const first = await app.inject(request);
    const retry = await app.inject(request);

    expect(first.statusCode).toBe(202);
    expect(retry.statusCode).toBe(202);
    expect(retry.json().jobId).toBe(first.json().jobId);
    expect(harness.state.jobs.size).toBe(1);
  });

  it('consolidates authenticated and webhook generation into one durable job', async () => {
    const harness = createInMemoryBackendDependencies();
    const generate = vi.fn(async () => 'https://img.test/shared.png');
    harness.dependencies.illustrationProvider = { generate };
    const app = await buildServer({ dependencies: harness.dependencies });
    const eventId = 'shared-event';

    const authenticated = await app.inject({
      method: 'POST',
      url: '/api/images/generate-for-story',
      headers: { 'idempotency-key': eventId },
      payload: { prompt: 'A safe woodland scene' },
    });
    const rawBody = JSON.stringify({
      user_id: 'user_1',
      session_id: 'session_1',
      event_id: eventId,
      prompt: 'A safe woodland scene',
    });
    const webhook = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      headers: signedHeaders(rawBody),
      payload: rawBody,
    });

    expect(webhook.json().jobId).toBe(authenticated.json().jobId);
    expect(harness.state.jobs.size).toBe(1);
    await harness.drainIllustrationJobs();
    expect(generate).toHaveBeenCalledOnce();
  });

  it('requires an authenticated session for the event stream', async () => {
    authState.userId = null;
    authState.sessionId = null;
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const response = await app.inject({
      method: 'GET',
      url: '/events/story-illustrations',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'UNAUTHORIZED' });
  });

  it('allows only the configured browser origin', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const allowed = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: process.env.FRONTEND_URL! },
    });
    const denied = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://attacker.example' },
    });

    expect(allowed.headers['access-control-allow-origin']).toBe(
      process.env.FRONTEND_URL,
    );
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not log provider errors, prompts, or owner identifiers', async () => {
    const job = {
      id: 'job_1',
      ownerId: 'owner-secret',
      sessionId: 'session-secret',
      idempotencyKey: 'key',
      prompt: 'private story prompt',
      status: 'pending' as const,
      imageUrl: null,
      errorCode: null,
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const repository: IllustrationJobRepository = {
      enqueue: vi.fn(async () => job),
      getForOwner: vi.fn(async () => job),
      markProcessing: vi.fn(async () => ({
        ...job,
        status: 'processing' as const,
      })),
      markCompleted: vi.fn(async () => undefined),
      markFailed: vi.fn(async () => undefined),
    };
    const logError = vi.fn();
    const logger = { error: logError } as unknown as FastifyBaseLogger;
    const scheduled: Array<() => Promise<void>> = [];
    const service = new IllustrationJobService(
      repository,
      {
        async generate() {
          throw new Error('vendor-secret-detail private story prompt');
        },
      },
      { publish: vi.fn() },
      (task) => scheduled.push(task),
      logger,
    );

    await service.enqueue({
      ownerId: job.ownerId,
      sessionId: job.sessionId,
      idempotencyKey: job.idempotencyKey,
      prompt: job.prompt,
    });
    await scheduled[0]();

    const logged = JSON.stringify(logError.mock.calls);
    expect(logged).not.toContain('vendor-secret-detail');
    expect(logged).not.toContain('private story prompt');
    expect(logged).not.toContain('owner-secret');
    expect(logged).not.toContain('session-secret');
    expect(logged).toContain('job_1');
  });
});
