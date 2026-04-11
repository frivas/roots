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

describe('services routes', () => {
  it('GET /api/services returns 200 with array of services', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/services' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('name');
    expect(body[0]).toHaveProperty('isActive');
  });

  it('GET /api/services returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/services' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/services/:id returns 200 for a known service', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/services/classroom' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('id', 'classroom');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('details');
  });

  it('GET /api/services/:id returns 404 for an unknown service', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/services/nonexistent' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/services/:id returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/services/classroom' });
    expect(res.statusCode).toBe(401);
  });
});
