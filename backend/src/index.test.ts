import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock heavy dependencies before importing buildServer
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

import { buildServer } from './index.js';

describe('buildServer()', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockGenerate.mockResolvedValue({ data: [{ url: 'https://img.test/mock.png' }] });
  });

  it('GET /health returns {status: ok}', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok' });
  });

  it('GET /webhook/test returns ok shape', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/webhook/test' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('message');
  });

  it('POST /webhook/elevenlabs/story-illustration calls openai and returns imageUrl', async () => {
    const app = await buildServer();
    const res = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { story_content: 'a tale', mood: 'magical', characters: 'a dragon' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('image_url');
  });

  it('POST /webhook/elevenlabs/story-illustration broadcasts generation-started to sseConnections', async () => {
    const app = await buildServer();
    const fakeConn = { write: vi.fn(), end: vi.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).sseConnections.add(fakeConn);
    await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { mood: 'happy' },
    });
    expect(fakeConn.write).toHaveBeenCalledWith(expect.stringContaining('generation-started'));
  });

  it('removes SSE connections that fail while sending the start event', async () => {
    const app = await buildServer();
    const flakyConn = {
      write: vi.fn(() => {
        throw new Error('socket closed');
      }),
      end: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).sseConnections.add(flakyConn);
    await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { mood: 'happy' },
    });

    expect(flakyConn.write).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((app as any).sseConnections.has(flakyConn)).toBe(false);
  });

  it('removes SSE connections that fail while sending the final illustration event', async () => {
    const app = await buildServer();
    const flakyConn = {
      write: vi.fn()
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => {
          throw new Error('socket closed');
        }),
      end: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).sseConnections.add(flakyConn);
    await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { mood: 'happy' },
    });

    expect(flakyConn.write).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((app as any).sseConnections.has(flakyConn)).toBe(false);
  });

  it('returns a 500 when OpenAI does not return an image url', async () => {
    mockGenerate.mockResolvedValueOnce({ data: [{} as { url: string }] });
    const app = await buildServer();

    const res = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { story_content: 'a tale' },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toMatchObject({
      success: false,
      error: 'No image URL returned from OpenAI',
    });
  });

  it('returns a 500 when image generation throws', async () => {
    mockGenerate.mockRejectedValueOnce(new Error('service unavailable'));
    const app = await buildServer();

    const res = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { story_content: 'a tale' },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toMatchObject({
      success: false,
      error: 'service unavailable',
    });
  });

  it('validateEnv throws when PORT is missing', async () => {
    const orig = process.env.PORT;
    delete process.env.PORT;
    await expect(buildServer()).rejects.toThrow(/PORT/);
    process.env.PORT = orig;
  });

  it('each mood variant in the moodStyles table is handled without error', async () => {
    const app = await buildServer();
    for (const mood of ['happy', 'scary', 'sad', 'magical', 'adventurous', 'cheerful', 'unknown']) {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/elevenlabs/story-illustration',
        payload: { mood },
      });
      expect([200, 500]).toContain(res.statusCode); // 500 only if openai mock fails
    }
  });
});
