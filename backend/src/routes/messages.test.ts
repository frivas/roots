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

const createHarness = () =>
  createInMemoryBackendDependencies({
    users: [
      { id: 'user_1', role: 'parent' },
      { id: 'user_2', role: 'teacher' },
    ],
    messages: [
      {
        id: 'owned_message',
        senderId: 'user_2',
        recipientId: 'user_1',
        subject: 'Owned',
        body: 'Visible',
      },
      {
        id: 'private_message',
        senderId: 'user_2',
        recipientId: 'user_2',
        subject: 'Private',
        body: 'Hidden',
      },
    ],
  });

describe('messages routes', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
  });

  it('lists only participating messages and hides cross-user IDs', async () => {
    const harness = createHarness();
    const app = await buildServer({ dependencies: harness.dependencies });

    const listed = await app.inject({ method: 'GET', url: '/api/messages' });
    const hidden = await app.inject({
      method: 'GET',
      url: '/api/messages/private_message',
    });

    expect(listed.json()).toEqual([
      expect.objectContaining({ id: 'owned_message' }),
    ]);
    expect(hidden.statusCode).toBe(404);
  });

  it('persists create, read, and delete mutations', async () => {
    const harness = createHarness();
    const app = await buildServer({ dependencies: harness.dependencies });
    const created = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: {
        recipientId: 'user_2',
        recipient: 'Teacher',
        subject: 'Hello',
        body: 'World',
      },
    });
    const id = created.json().data.id as string;

    expect(created.statusCode).toBe(201);
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/api/messages/${id}/read`,
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: 'DELETE',
          url: `/api/messages/${id}`,
        })
      ).statusCode,
    ).toBe(200);
  });

  it('rejects missing recipient ownership input before persistence', async () => {
    const harness = createHarness();
    const app = await buildServer({ dependencies: harness.dependencies });

    const response = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { recipient: 'Teacher', subject: 'Hello', body: 'World' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: 'VALIDATION_FAILED' });
  });
});
