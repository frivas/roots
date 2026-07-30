import { beforeEach, describe, expect, it, vi } from 'vitest';

const authState = vi.hoisted(() => ({
  userId: 'user_1',
  sessionId: 'session_1',
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

describe('notifications routes', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
  });

  it('persists self-notifications and read mutations', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [{ id: 'user_1', role: 'parent' }],
    });
    const app = await buildServer({ dependencies: harness.dependencies });
    const created = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: {
        title: 'Notice',
        message: 'Hello',
        type: 'info',
        recipientId: 'user_1',
      },
    });
    const id = created.json().data.id as string;

    expect(created.statusCode).toBe(201);
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/api/notifications/${id}/read`,
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (await app.inject({ method: 'GET', url: '/api/notifications' })).json(),
    ).toEqual([expect.objectContaining({ id, read: true })]);
  });

  it('denies non-admin cross-user creation', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [
        { id: 'user_1', role: 'parent' },
        { id: 'user_2', role: 'teacher' },
      ],
    });
    const app = await buildServer({ dependencies: harness.dependencies });

    const response = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: {
        title: 'Notice',
        message: 'Cross user',
        type: 'warning',
        recipientId: 'user_2',
      },
    });

    expect(response.statusCode).toBe(403);
  });
});
