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

describe('messages routes', () => {
  it('GET /api/messages returns 200 with array of messages', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/messages' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('subject');
  });

  it('GET /api/messages returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/messages' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/messages/:id returns 200 for a known message', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/messages/1' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('id', '1');
  });

  it('GET /api/messages/:id returns 404 for an unknown message', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/messages/nonexistent' });
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/messages/:id returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/api/messages/1' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/messages returns 200 with success and message data', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { recipient: 'Alice', subject: 'Hello', body: 'World' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
  });

  it('POST /api/messages returns 400 when required fields are missing', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { recipient: 'Alice' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/messages returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/messages',
      payload: { recipient: 'Alice', subject: 'Hello', body: 'World' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/messages/:id/read returns 200 with success', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'PATCH', url: '/api/messages/1/read' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('success', true);
  });

  it('PATCH /api/messages/:id/read returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'PATCH', url: '/api/messages/1/read' });
    expect(res.statusCode).toBe(401);
  });

  it('DELETE /api/messages/:id returns 200 with success', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'DELETE', url: '/api/messages/1' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('success', true);
  });

  it('DELETE /api/messages/:id returns 401 when userId is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getAuth).mockReturnValueOnce({ userId: null } as any);
    const app = await buildServer();
    const res = await app.inject({ method: 'DELETE', url: '/api/messages/1' });
    expect(res.statusCode).toBe(401);
  });
});
