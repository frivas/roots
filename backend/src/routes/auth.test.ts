import { describe, it, expect, vi } from 'vitest';

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({ userId: 'u1' })),
}));
vi.mock('openai', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockOpenAI = function(this: any) {
    this.images = { generate: vi.fn(async () => ({ data: [{ url: 'https://img.test/mock.png' }] })) };
  };
  return { default: MockOpenAI };
});

import { buildServer } from '../index.js';
import { getAuth } from '@clerk/fastify';

describe('auth routes', () => {
  it('GET /api/auth/user returns 200 with userId as id', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/auth/user' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('id', 'u1');
  });

  it('GET /api/auth/user returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/auth/user' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/role returns 200 with role field', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/auth/role' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('role');
  });

  it('GET /api/auth/role returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/auth/role' });
    expect(res.statusCode).toBe(401);
  });
});
