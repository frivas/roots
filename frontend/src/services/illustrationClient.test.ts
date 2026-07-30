import { describe, expect, it, vi } from 'vitest';
import {
  appendRecentStoryTurn,
  createConversationEndGuard,
  createIllustrationClient,
  createStoryTurnIdempotencyKey,
  isExplicitIllustrationRequest,
  isIllustrationOffer,
} from './illustrationClient';

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(body),
}) as unknown as Response;

describe('illustration client', () => {
  it('authenticates a structured request and polls its status URL to completion', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response({
        jobId: 'job-1',
        status: 'pending',
        statusUrl: '/api/images/jobs/job-1',
      }, 202))
      .mockResolvedValueOnce(response({ jobId: 'job-1', status: 'processing' }))
      .mockResolvedValueOnce(response({
        jobId: 'job-1',
        status: 'completed',
        imageUrl: 'https://images.example/story.png',
      }));
    const wait = vi.fn().mockResolvedValue(undefined);
    const client = createIllustrationClient({
      baseUrl: 'https://api.example.test',
      fetcher,
      getToken: vi.fn().mockResolvedValue('clerk-token'),
      pollIntervalMs: 1,
      wait,
    });
    const story = {
      story_content: 'A dragon crossed the moonlit forest.',
      characters: 'dragon',
      setting: 'forest',
      mood: 'magical',
      current_scene: 'The dragon found a glowing map.',
    };

    await expect(client.generate(story, 'story-session-turn-1'))
      .resolves.toBe('https://images.example/story.png');

    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      new URL('https://api.example.test/api/images/generate-for-story'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer clerk-token',
          'Idempotency-Key': 'story-session-turn-1',
        }),
        body: JSON.stringify(story),
      }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      new URL('https://api.example.test/api/images/jobs/job-1'),
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer clerk-token' },
      }),
    );
    expect(wait).toHaveBeenCalledTimes(2);
  });

  it('uses a stable turn key and deduplicates repeated generation for that turn', async () => {
    const fetcher = vi.fn().mockResolvedValue(response({
      status: 'completed',
      imageUrl: 'https://images.example/story.png',
    }));
    const client = createIllustrationClient({
      baseUrl: 'https://api.example.test',
      fetcher,
      getToken: vi.fn().mockResolvedValue('clerk-token'),
    });
    const firstKey = createStoryTurnIdempotencyKey('session-1', 'agent-2:draw it');
    const repeatedKey = createStoryTurnIdempotencyKey('session-1', 'agent-2:draw it');
    const story = { story_content: 'Draw the dragon by the castle.' };

    expect(repeatedKey).toBe(firstKey);
    expect(createStoryTurnIdempotencyKey('session-1', 'agent-3:draw it'))
      .not.toBe(firstKey);
    await expect(Promise.all([
      client.generate(story, firstKey),
      client.generate(story, repeatedKey),
    ])).resolves.toEqual([
      'https://images.example/story.png',
      'https://images.example/story.png',
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('performs exactly one recovery after consecutive pending polls without fanout', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response({
        jobId: 'job-1',
        status: 'pending',
        statusUrl: '/api/images/jobs/job-1',
      }, 202))
      .mockResolvedValueOnce(response({ jobId: 'job-1', status: 'pending' }))
      .mockResolvedValueOnce(response({ jobId: 'job-1', status: 'pending' }))
      .mockResolvedValueOnce(response({ jobId: 'job-1', status: 'pending' }, 202))
      .mockResolvedValueOnce(response({ jobId: 'job-1', status: 'pending' }))
      .mockResolvedValueOnce(response({ jobId: 'job-1', status: 'pending' }))
      .mockResolvedValueOnce(response({
        jobId: 'job-1',
        status: 'completed',
        imageUrl: 'https://images.example/recovered.png',
      }));
    const client = createIllustrationClient({
      baseUrl: 'https://api.example.test',
      fetcher,
      getToken: vi.fn().mockResolvedValue('clerk-token'),
      recoveryAfterPendingPolls: 2,
      wait: vi.fn().mockResolvedValue(undefined),
    });
    const key = createStoryTurnIdempotencyKey('session-1', 'turn-1');
    const story = { story_content: 'A dragon waits in the forest.' };

    await expect(Promise.all([
      client.generate(story, key),
      client.generate(story, key),
    ])).resolves.toEqual([
      'https://images.example/recovered.png',
      'https://images.example/recovered.png',
    ]);

    const calls = fetcher.mock.calls.map(([url, init]) => ({
      method: (init as RequestInit).method,
      url: String(url),
    }));
    expect(calls.filter(({ method }) => method === 'POST')).toEqual([
      {
        method: 'POST',
        url: 'https://api.example.test/api/images/generate-for-story',
      },
      {
        method: 'POST',
        url: 'https://api.example.test/api/images/jobs/job-1/recover',
      },
    ]);
    expect(fetcher).toHaveBeenCalledTimes(7);
  });

  it('does not send an auth token to a cross-origin status URL', async () => {
    const fetcher = vi.fn().mockResolvedValue(response({
      status: 'pending',
      statusUrl: 'https://attacker.example/jobs/1',
    }, 202));
    const client = createIllustrationClient({
      baseUrl: 'https://api.example.test',
      fetcher,
      getToken: vi.fn().mockResolvedValue('clerk-token'),
    });

    await expect(client.generate(
      { story_content: 'A short story.' },
      'story-session-turn-1',
    )).rejects.toThrow(/untrusted status URL/);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('story illustration intent and lifecycle', () => {
  it('requires explicit user intent instead of incidental image words', () => {
    expect(isExplicitIllustrationRequest('Please draw the dragon.')).toBe(true);
    expect(isExplicitIllustrationRequest('Create an image of the castle.')).toBe(true);
    expect(isExplicitIllustrationRequest('I saw a picture in the story.')).toBe(false);
    expect(isExplicitIllustrationRequest("Don't draw the dragon.")).toBe(false);
    expect(isIllustrationOffer('Would you like me to make an illustration?')).toBe(true);
  });

  it('suppresses repeated conversation-end work until new activity occurs', () => {
    const guard = createConversationEndGuard();
    const generate = vi.fn();

    expect(guard.end(generate)).toBe(true);
    expect(guard.end(generate)).toBe(false);
    expect(generate).toHaveBeenCalledTimes(1);

    guard.noteActivity();
    expect(guard.end(generate)).toBe(true);
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('keeps only a bounded recent story window', () => {
    let turns: string[] = [];
    for (let index = 0; index < 30; index += 1) {
      turns = appendRecentStoryTurn(turns, 'agent', `turn ${index} ${'x'.repeat(400)}`);
    }

    expect(turns.length).toBeLessThanOrEqual(12);
    expect(turns.join('\n').length).toBeLessThanOrEqual(4_000);
    expect(turns[turns.length - 1]).toContain('turn 29');
  });
});
