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

describe('settings routes', () => {
  beforeEach(() => {
    authState.userId = 'user_1';
    authState.sessionId = 'session_1';
  });

  it('persists updates and reset defaults', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const updated = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      payload: { language: 'Spanish', emailNotifications: false },
    });
    const persisted = await app.inject({
      method: 'GET',
      url: '/api/settings',
    });
    const reset = await app.inject({
      method: 'POST',
      url: '/api/settings/reset',
    });

    expect(updated.json().data).toMatchObject({
      language: 'Spanish',
      emailNotifications: false,
    });
    expect(persisted.json()).toMatchObject({ language: 'Spanish' });
    expect(reset.json().data).toMatchObject({
      language: 'English',
      emailNotifications: true,
    });
  });

  it('rejects unknown settings fields', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const response = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      payload: { userId: 'attacker' },
    });

    expect(response.statusCode).toBe(400);
  });
});
