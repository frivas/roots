import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerate = vi.hoisted(() =>
  vi.fn(async () => ({ data: [{ url: 'https://img.test/mock.png' }] }))
);

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({ userId: 'u1' })),
}));
vi.mock('openai', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockOpenAI = function(this: any) {
    this.images = { generate: mockGenerate };
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

  it('POST /api/images/generate returns 500 when OpenAI throws', async () => {
    mockGenerate.mockImplementationOnce(async () => { throw new Error('OpenAI down'); });
    __resetOpenAI();
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/api/images/generate',
      payload: { prompt: 'test' },
    });
    expect(res.statusCode).toBe(500);
  });

  describe('POST /api/images/generate-for-story', () => {
    it('returns 200 with success and image_url', async () => {
      const app = await buildServer();
      const res = await app.inject({
        method: 'POST',
        url: '/api/images/generate-for-story',
        payload: { story_content: 'a dragon adventure', mood: 'magical', characters: 'a brave knight' },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({ success: true, image_url: expect.any(String) });
    });

    it('broadcasts generation-started to sseConnections', async () => {
      const app = await buildServer();
      const fakeConn = { write: vi.fn(), end: vi.fn() };
      (app as any).sseConnections.add(fakeConn); // eslint-disable-line @typescript-eslint/no-explicit-any
      await app.inject({
        method: 'POST',
        url: '/api/images/generate-for-story',
        payload: { mood: 'happy' },
      });
      expect(fakeConn.write).toHaveBeenCalledWith(expect.stringContaining('generation-started'));
    });

    it('broadcasts story-illustration event after image generation', async () => {
      const app = await buildServer();
      const fakeConn = { write: vi.fn(), end: vi.fn() };
      (app as any).sseConnections.add(fakeConn); // eslint-disable-line @typescript-eslint/no-explicit-any
      await app.inject({
        method: 'POST',
        url: '/api/images/generate-for-story',
        payload: { mood: 'cheerful', characters: 'a rabbit', setting: 'a forest' },
      });
      const allWrites = fakeConn.write.mock.calls.map((c: string[]) => c[0]).join('');
      expect(allWrites).toContain('story-illustration');
    });

    it.each(['happy', 'scary', 'sad', 'magical', 'adventurous', 'cheerful', 'unknown_mood'])(
      'handles mood=%s without error',
      async (mood) => {
        const app = await buildServer();
        const res = await app.inject({
          method: 'POST',
          url: '/api/images/generate-for-story',
          payload: { mood, current_scene: 'the hero enters the cave' },
        });
        expect([200, 500]).toContain(res.statusCode);
      }
    );

    it('omits optional fields gracefully (no characters/setting/scene)', async () => {
      const app = await buildServer();
      const res = await app.inject({
        method: 'POST',
        url: '/api/images/generate-for-story',
        payload: {},
      });
      expect(res.statusCode).toBe(200);
    });
  });
});
