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

describe('auth routes', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
  });

  it('returns the persisted current user and server-side role', async () => {
    const harness = createInMemoryBackendDependencies({
      users: [{ id: 'user_1', role: 'teacher' }],
    });
    const app = await buildServer({ dependencies: harness.dependencies });

    const user = await app.inject({ method: 'GET', url: '/api/auth/user' });
    const role = await app.inject({ method: 'GET', url: '/api/auth/role' });

    expect(user.json()).toMatchObject({ id: 'user_1', role: 'teacher' });
    expect(role.json()).toEqual({ role: 'teacher' });
  });

  it('rejects an incomplete Clerk session', async () => {
    authState.sessionId = null;
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/user',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'UNAUTHORIZED' });
  });
});
