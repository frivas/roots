import { describe, it, expect, vi, beforeEach } from 'vitest';

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
import { __resetOpenAI } from './images.js';
import { getAuth } from '@clerk/fastify';

describe('images routes', () => {
  beforeEach(() => { __resetOpenAI(); });

  it('GET /api/images/test returns 200 with message', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/images/test' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('message');
  });

  it('POST /api/images/generate returns 200 with imageUrl', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: { prompt: 'a sunny day' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('imageUrl');
  });

  it('POST /api/images/generate returns 400 without prompt', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'POST', url: '/api/images/generate', payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/images/generate returns 401 when unauthenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: { prompt: 'test' },
    });
    expect(res.statusCode).toBe(401);
  });
});
