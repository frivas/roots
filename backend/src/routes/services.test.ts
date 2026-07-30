import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: 'user_1',
    sessionId: 'session_1',
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

import { buildServer } from '../index.js';
import { createInMemoryBackendDependencies } from '../test/inMemoryBackend.js';

describe('services routes', () => {
  it('returns persisted active services and opaque not-found responses', async () => {
    const harness = createInMemoryBackendDependencies();
    const app = await buildServer({ dependencies: harness.dependencies });

    const listed = await app.inject({ method: 'GET', url: '/api/services' });
    const known = await app.inject({
      method: 'GET',
      url: '/api/services/storytelling',
    });
    const unknown = await app.inject({
      method: 'GET',
      url: '/api/services/missing',
    });

    expect(listed.json()).toEqual([
      expect.objectContaining({ id: 'storytelling', isActive: true }),
    ]);
    expect(known.statusCode).toBe(200);
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'NOT_FOUND' });
  });
});
