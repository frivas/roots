import { describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/fastify', () => ({
  clerkPlugin: async () => {},
  getAuth: vi.fn(() => ({
    userId: 'demo_user',
    sessionId: 'demo_session',
    getToken: vi.fn(async () => 'clerk-session-token'),
  })),
}));

import { buildServer } from './index.js';
import { createDemoDependencies } from './dependencies.js';
import {
  DemoDataRepository,
  DemoIllustrationJobRepository,
} from './repositories/demo-repository.js';

describe('demo backend mode', () => {
  it('selects demo dependencies by default', async () => {
    const app = await buildServer();
    const response = await app.inject({ method: 'GET', url: '/ready' });

    expect(response.json()).toMatchObject({
      status: 'ready',
      mode: 'demo',
      checks: { openai: 'disabled', supabase: 'disabled' },
    });
  });

  it('reports disabled external dependencies without probing them', async () => {
    const dependencies = createDemoDependencies();
    const app = await buildServer({ dependencies });

    const health = await app.inject({ method: 'GET', url: '/health' });
    const ready = await app.inject({ method: 'GET', url: '/ready' });

    expect(health.json()).toMatchObject({ status: 'ok', mode: 'demo' });
    expect(ready.statusCode).toBe(200);
    expect(ready.json()).toEqual({
      status: 'ready',
      mode: 'demo',
      releaseSha: 'local',
      checks: {
        clerk: 'configured',
        openai: 'disabled',
        supabase: 'disabled',
      },
    });
  });

  it('serves empty/default data with an explicit demo marker', async () => {
    const app = await buildServer({ dependencies: createDemoDependencies() });

    const messages = await app.inject({ method: 'GET', url: '/api/messages' });
    const settings = await app.inject({ method: 'GET', url: '/api/settings' });
    const role = await app.inject({ method: 'GET', url: '/api/auth/role' });

    expect(messages.statusCode).toBe(200);
    expect(messages.json()).toEqual([]);
    expect(messages.headers['x-roots-mode']).toBe('demo');
    expect(settings.json()).toMatchObject({ userId: 'demo_user' });
    expect(role.json()).toEqual({ role: 'user' });
  });

  it.each([
    ['POST', '/api/messages', { recipientId: 'user_2', recipient: 'Teacher', subject: 'Hello', body: 'World' }],
    ['PATCH', '/api/settings', { language: 'Spanish' }],
    ['POST', '/api/images/generate-for-story', { prompt: 'A safe forest scene' }],
  ] as const)('rejects %s %s rather than claiming durable success', async (method, url, payload) => {
    const app = await buildServer({ dependencies: createDemoDependencies() });
    const response = await app.inject({ method, url, payload });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ error: 'DEMO_MODE_UNAVAILABLE' });
  });

  it('keeps every demo mutation and illustration job operation unavailable', async () => {
    const data = new DemoDataRepository('demo_user');
    const jobs = new DemoIllustrationJobRepository();
    const unavailable = { message: 'DEMO_MODE_UNAVAILABLE' };

    await expect(data.createMessage({
      recipientId: 'recipient',
      recipient: 'Teacher',
      subject: 'Subject',
      body: 'Body',
    })).rejects.toMatchObject(unavailable);
    await expect(data.markMessageRead('message')).rejects.toMatchObject(unavailable);
    await expect(data.deleteMessage('message')).rejects.toMatchObject(unavailable);
    await expect(data.markNotificationRead('notification')).rejects.toMatchObject(unavailable);
    await expect(data.markAllNotificationsRead()).rejects.toMatchObject(unavailable);
    await expect(data.createNotification({
      title: 'Title',
      message: 'Message',
      type: 'info',
      recipientId: 'recipient',
    })).rejects.toMatchObject(unavailable);
    await expect(data.updateSettings({ language: 'Spanish' })).rejects.toMatchObject(unavailable);
    await expect(data.resetSettings()).rejects.toMatchObject(unavailable);
    await expect(jobs.enqueue()).rejects.toMatchObject(unavailable);
    await expect(jobs.getForOwner()).rejects.toMatchObject(unavailable);
    await expect(jobs.markProcessing()).rejects.toMatchObject(unavailable);
    await expect(jobs.markCompleted()).rejects.toMatchObject(unavailable);
    await expect(jobs.markFailed()).rejects.toMatchObject(unavailable);
  });

  it('keeps demo reads neutral and deterministic', async () => {
    const data = new DemoDataRepository('demo_user');

    await expect(data.getCurrentUser()).resolves.toMatchObject({
      id: 'demo_user',
      role: 'user',
    });
    await expect(data.listMessages({ limit: 20 })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
    await expect(data.getMessage('missing')).resolves.toBeNull();
    await expect(data.listNotifications({ limit: 20 })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
    await expect(data.getSettings()).resolves.toMatchObject({
      id: 'demo-settings',
      userId: 'demo_user',
    });
    await expect(data.listServices()).resolves.toHaveLength(1);
    await expect(data.getService('storytelling')).resolves.toMatchObject({
      id: 'storytelling',
    });
    await expect(data.getService('missing')).resolves.toBeNull();
  });
});
