import type { ServerResponse } from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import { SessionEventRegistry } from './session-events.js';

const response = () =>
  ({
    write: vi.fn(),
  }) as unknown as ServerResponse;

describe('SessionEventRegistry', () => {
  it('publishes only to the matching owner and session', () => {
    const registry = new SessionEventRegistry();
    const intended = response();
    const otherSession = response();
    const otherOwner = response();
    registry.subscribe('user_1', 'session_1', intended);
    registry.subscribe('user_1', 'session_2', otherSession);
    registry.subscribe('user_2', 'session_1', otherOwner);

    registry.publish('user_1', 'session_1', {
      type: 'illustration-completed',
      jobId: 'job_1',
      imageUrl: 'https://img.test/job_1.png',
    });

    expect(intended.write).toHaveBeenCalledOnce();
    expect(otherSession.write).not.toHaveBeenCalled();
    expect(otherOwner.write).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(intended.write).mock.calls)).not.toContain(
      'private prompt',
    );
  });

  it('removes a broken connection without affecting the channel', () => {
    const registry = new SessionEventRegistry();
    const broken = {
      write: vi.fn(() => {
        throw new Error('connection closed');
      }),
    } as unknown as ServerResponse;
    const healthy = response();
    registry.subscribe('user_1', 'session_1', broken);
    registry.subscribe('user_1', 'session_1', healthy);

    registry.publish('user_1', 'session_1', {
      type: 'illustration-failed',
      jobId: 'job_1',
      errorCode: 'IMAGE_GENERATION_FAILED',
    });

    expect(registry.count('user_1', 'session_1')).toBe(1);
    expect(healthy.write).toHaveBeenCalledOnce();
  });
});
