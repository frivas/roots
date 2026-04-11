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

describe('notifications routes', () => {
  it('GET /api/notifications returns 200 with array of notifications', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/notifications' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('title');
    expect(body[0]).toHaveProperty('type');
  });

  it('GET /api/notifications returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/notifications' });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/notifications/:id/read returns 200 with success', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'PATCH', url: '/api/notifications/1/read' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('success', true);
  });

  it('PATCH /api/notifications/:id/read returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'PATCH', url: '/api/notifications/1/read' });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/notifications/read-all returns 200 with success', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'PATCH', url: '/api/notifications/read-all' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('success', true);
  });

  it('PATCH /api/notifications/read-all returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'PATCH', url: '/api/notifications/read-all' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/notifications returns 200 with success and new notification data', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: { title: 'Test', message: 'Hello', type: 'info', recipientId: 'user_abc' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
  });

  it('POST /api/notifications returns 400 when required fields are missing', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: { title: 'Test' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/notifications returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/notifications',
      payload: { title: 'Test', message: 'Hello', type: 'info', recipientId: 'user_abc' },
    });
    expect(res.statusCode).toBe(401);
  });
});
