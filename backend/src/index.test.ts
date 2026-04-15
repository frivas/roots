import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateImage = vi.fn(async () => ({ data: [{ url: 'https://img.test/mock.png' }] }));

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({ userId: 'u1' })),
}));

vi.mock('openai', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockOpenAI = function (this: any) {
    this.images = { generate: mockGenerateImage };
  };
  return { default: MockOpenAI };
});

import { buildServer } from './index.js';

describe('buildServer()', () => {
  beforeEach(() => {
    mockGenerateImage.mockReset();
    mockGenerateImage.mockResolvedValue({ data: [{ url: 'https://img.test/mock.png' }] });
  });

  it('GET /health returns {status: ok}', async () => {
    const app = await buildServer();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok' });
  });

  it('GET /events/story-illustrations opens an SSE stream', async () => {
    const app = await buildServer();
    const responsePromise = app.inject({ method: 'GET', url: '/events/story-illustrations' });

    for (let attempt = 0; attempt < 20; attempt += 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((app as any).sseConnections.size > 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [connection] = Array.from((app as any).sseConnections) as Array<{ emit?: (event: string) => void }>;
    connection?.emit?.('close');

    await expect(responsePromise).rejects.toThrow('response destroyed before completion');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((app as any).sseConnections.size).toBe(0);
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
    expect(mockGenerateImage).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('enchanted atmosphere'),
      })
    );
  });

  it('removes an SSE connection when the generation-started broadcast fails', async () => {
    const app = await buildServer();
    const fakeConn = { write: vi.fn(() => { throw new Error('broken start stream'); }), end: vi.fn() };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).sseConnections.add(fakeConn);

    const res = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { mood: 'happy' },
    });

    expect(res.statusCode).toBe(200);
    expect(fakeConn.write).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((app as any).sseConnections.has(fakeConn)).toBe(false);
  });

  it('removes an SSE connection when the final illustration broadcast fails', async () => {
    const app = await buildServer();
    const fakeConn = {
      write: vi
        .fn()
        .mockImplementationOnce(() => undefined)
        .mockImplementationOnce(() => { throw new Error('broken illustration stream'); }),
      end: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (app as any).sseConnections.add(fakeConn);

    const res = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { mood: 'cheerful' },
    });

    expect(res.statusCode).toBe(200);
    expect(fakeConn.write).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((app as any).sseConnections.has(fakeConn)).toBe(false);
  });

  it('returns 500 when OpenAI does not return an image URL', async () => {
    mockGenerateImage.mockResolvedValueOnce({ data: [{}] });
    const app = await buildServer();

    const res = await app.inject({
      method: 'POST',
      url: '/webhook/elevenlabs/story-illustration',
      payload: { mood: 'unknown' },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toMatchObject({
      success: false,
      error: 'No image URL returned from OpenAI',
    });
  });

  it('validateEnv throws when PORT is missing', async () => {
    const orig = process.env.PORT;
    delete process.env.PORT;
    await expect(buildServer()).rejects.toThrow(/PORT/);
    process.env.PORT = orig;
  });

  it('handles each supported mood variant without error', async () => {
    const app = await buildServer();

    for (const mood of ['happy', 'scary', 'sad', 'magical', 'adventurous', 'cheerful', 'unknown']) {
      const res = await app.inject({
        method: 'POST',
        url: '/webhook/elevenlabs/story-illustration',
        payload: { mood },
      });

      expect([200, 500]).toContain(res.statusCode);
    }
  });
});
