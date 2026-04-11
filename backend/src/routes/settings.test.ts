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

describe('settings routes', () => {
  it('GET /api/settings returns 200 with settings object', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/settings' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('emailNotifications');
    expect(body).toHaveProperty('language');
    expect(body).toHaveProperty('timezone');
  });

  it('GET /api/settings returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/settings' });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/settings returns 200 with updated settings', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      payload: { language: 'Spanish', emailNotifications: false },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('language', 'Spanish');
  });

  it('PATCH /api/settings returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/settings',
      payload: { language: 'Spanish' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/settings/reset returns 200 with default settings', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'POST', url: '/api/settings/reset' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('timezone', 'UTC');
  });

  it('POST /api/settings/reset returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'POST', url: '/api/settings/reset' });
    expect(res.statusCode).toBe(401);
  });
});
