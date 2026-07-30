import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  userId: 'user_1' as string | null,
  sessionId: 'session_1' as string | null,
}));

const generateImage = vi.hoisted(() =>
  vi.fn(async () => ({ data: [{ url: 'https://img.test/generated.png' }] })),
);

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: authState.userId,
    sessionId: authState.sessionId,
    sessionClaims: { sub: authState.userId, sid: authState.sessionId },
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

vi.mock('openai', () => {
  const MockOpenAI = function (this: {
    images: { generate: typeof generateImage };
  }) {
    this.images = { generate: generateImage };
  };
  return { default: MockOpenAI };
});

import { buildServer } from './index.js';
import { createInMemoryBackendDependencies } from './test/inMemoryBackend.js';

describe('backend remediation contracts', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
    generateImage.mockReset();
    generateImage.mockResolvedValue({
      data: [{ url: 'https://img.test/generated.png' }],
    });
  });

  it('persists message and settings mutations across requests', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [
        { id: 'user_1', role: 'parent' },
        { id: 'user_2', role: 'teacher' },
      ],
    });
    const app = await buildServer({ dependencies: harness.dependencies });

    const sent = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: {
        recipientId: 'user_2',
        recipient: 'Teacher',
        subject: 'Hello',
        body: 'World',
      },
    });
    expect(sent.statusCode).toBe(201);

    const listed = await app.inject({ method: 'GET', url: '/api/messages' });
    expect(listed.json()).toEqual([
      expect.objectContaining({
        senderId: 'user_1',
        recipientId: 'user_2',
        subject: 'Hello',
      }),
    ]);

    const updated = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      payload: { language: 'Spanish', emailNotifications: false },
    });
    expect(updated.statusCode).toBe(200);

    const settings = await app.inject({ method: 'GET', url: '/api/settings' });
    expect(settings.json()).toMatchObject({
      userId: 'user_1',
      language: 'Spanish',
      emailNotifications: false,
    });
  });

  it('enforces ownership and server-side roles for mutations', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [
        { id: 'user_1', role: 'parent' },
        { id: 'user_2', role: 'teacher' },
        { id: 'admin_1', role: 'admin' },
      ],
      messages: [
        {
          id: 'message_2',
          senderId: 'user_2',
          recipientId: 'user_2',
          subject: 'Private',
          body: 'Private',
        },
      ],
    });
    const app = await buildServer({ dependencies: harness.dependencies });

    const deniedMessage = await app.inject({
      method: 'PATCH',
      url: '/api/messages/message_2/read',
    });
    expect(deniedMessage.statusCode).toBe(404);

    const deniedNotification = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: {
        title: 'Notice',
        message: 'Private',
        type: 'info',
        recipientId: 'user_2',
      },
    });
    expect(deniedNotification.statusCode).toBe(403);

    authState.userId = 'admin_1';
    authState.sessionId = 'session_admin';
    const allowedNotification = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: {
        title: 'Notice',
        message: 'Authorized',
        type: 'info',
        recipientId: 'user_2',
      },
    });
    expect(allowedNotification.statusCode).toBe(201);
  });

  it('accepts the frontend prompt contract and enqueues idempotently', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [{ id: 'user_1', role: 'parent' }],
    });
    const app = await buildServer({ dependencies: harness.dependencies });
    const request = {
      method: 'POST' as const,
      url: '/api/images/generate-for-story',
      headers: { 'idempotency-key': 'story-turn-1' },
      payload: { prompt: 'A child-safe dragon adventure' },
    };

    const first = await app.inject(request);
    const duplicate = await app.inject(request);

    expect(first.statusCode).toBe(202);
    expect(duplicate.statusCode).toBe(202);
    expect(first.json()).toMatchObject({
      jobId: expect.any(String),
      status: 'pending',
    });
    expect(duplicate.json().jobId).toBe(first.json().jobId);

    await harness.drainIllustrationJobs();
    expect(generateImage).toHaveBeenCalledTimes(1);
  });

  it('rejects oversized generation input before provider work', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [{ id: 'user_1', role: 'parent' }],
    });
    const app = await buildServer({ dependencies: harness.dependencies });
    const response = await app.inject({
      method: 'POST',
      url: '/api/images/generate-for-story',
      payload: { prompt: 'x'.repeat(4_001) },
    });

    expect(response.statusCode).toBe(400);
    expect(generateImage).not.toHaveBeenCalled();
  });

  it('returns an opaque error code when background generation fails', async () => {
    generateImage.mockRejectedValueOnce(new Error('vendor-secret-detail'));
    const harness = createInMemoryBackendDependencies({
      users: [{ id: 'user_1', role: 'parent' }],
    });
    const app = await buildServer({ dependencies: harness.dependencies });
    const queued = await app.inject({
      method: 'POST',
      url: '/api/images/generate-for-story',
      headers: { 'idempotency-key': 'failed-turn' },
      payload: { prompt: 'A forest scene' },
    });

    await harness.drainIllustrationJobs();
    const status = await app.inject({
      method: 'GET',
      url: `/api/images/jobs/${queued.json().jobId}`,
    });

    expect(status.statusCode).toBe(200);
    expect(status.json()).toMatchObject({
      status: 'failed',
      errorCode: 'IMAGE_GENERATION_FAILED',
    });
    expect(JSON.stringify(status.json())).not.toContain('vendor-secret-detail');
  });
});
