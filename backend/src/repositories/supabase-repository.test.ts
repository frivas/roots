import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationError } from '../lib/application-error.js';
import type { Database } from '../types/supabase.js';
import {
  SupabaseDataRepository,
  SupabaseIllustrationJobRepository,
} from './supabase-repository.js';

type Response = {
  data: unknown;
  error: { code?: string; message: string } | null;
};

const ok = (data: unknown): Response => ({ data, error: null });
const failed = (code = 'XX000'): Response => ({
  data: null,
  error: { code, message: 'sensitive database detail' },
});

const userRow = {
  id: 'user_1',
  email: 'user@example.test',
  first_name: 'Ada',
  last_name: 'Lovelace',
  role: 'parent',
  department: null,
  created_at: '2026-07-30T00:00:00.000Z',
  updated_at: '2026-07-30T00:00:00.000Z',
};
const messageRow = {
  id: '00000000-0000-4000-8000-000000000001',
  subject: 'Hello',
  body: 'World',
  read: false,
  starred: false,
  created_at: '2026-07-30T00:00:00.000Z',
  sender_id: 'user_1',
  recipient_id: 'user_2',
};
const notificationRow = {
  id: '00000000-0000-4000-8000-000000000002',
  title: 'Notice',
  message: 'Hello',
  type: 'info',
  read: false,
  created_at: '2026-07-30T00:00:00.000Z',
  user_id: 'user_1',
};
const settingsRow = {
  id: 'settings_1',
  email_notifications: true,
  sms_notifications: false,
  push_notifications: false,
  language: 'English',
  timezone: 'UTC',
  updated_at: '2026-07-30T00:00:00.000Z',
  user_id: 'user_1',
};
const serviceRow = {
  id: 'storytelling',
  name: 'Storytelling',
  description: 'Interactive storytelling',
  is_active: true,
  created_at: '2026-07-30T00:00:00.000Z',
  updated_at: '2026-07-30T00:00:00.000Z',
};
const jobRow = {
  id: 'job_1',
  owner_id: 'user_1',
  session_id: 'session_1',
  idempotency_key: 'turn_1',
  prompt: 'A safe story scene',
  status: 'pending' as const,
  image_url: null,
  error_code: null,
  attempts: 0,
  locked_at: null,
  created_at: '2026-07-30T00:00:00.000Z',
  updated_at: '2026-07-30T00:00:00.000Z',
};

const clientHarness = (...responses: Response[]) => {
  const queue = [...responses];
  const calls: Array<{ operation: string; args: unknown[] }> = [];
  const query = (response: Response) => {
    const builder: Record<string, unknown> = {};
    for (const operation of [
      'delete',
      'eq',
      'insert',
      'limit',
      'or',
      'order',
      'select',
      'update',
      'upsert',
    ]) {
      builder[operation] = (...args: unknown[]) => {
        calls.push({ operation, args });
        return builder;
      };
    }
    builder.single = vi.fn(async () => response);
    builder.maybeSingle = vi.fn(async () => response);
    builder.then = (
      resolve: (value: Response) => unknown,
      reject: (reason: unknown) => unknown,
    ) => Promise.resolve(response).then(resolve, reject);
    return builder;
  };
  const next = () => query(queue.shift() ?? ok(null));
  const client = {
    from: vi.fn(() => next()),
    rpc: vi.fn(() => next()),
  } as unknown as SupabaseClient<Database>;
  return { calls, client };
};

describe('SupabaseDataRepository', () => {
  it('maps current users and falls back unknown database roles to user', async () => {
    const known = clientHarness(ok(userRow));
    const unknown = clientHarness(ok({ ...userRow, role: 'legacy-role' }));

    await expect(
      new SupabaseDataRepository(known.client, 'user_1').getCurrentUser(),
    ).resolves.toMatchObject({
      id: 'user_1',
      firstName: 'Ada',
      role: 'parent',
    });
    await expect(
      new SupabaseDataRepository(unknown.client, 'user_1').getCurrentUser(),
    ).resolves.toMatchObject({ role: 'user' });
  });

  it('maps message queries and persists message mutations', async () => {
    const harness = clientHarness(
      ok([messageRow]),
      ok(messageRow),
      ok(userRow),
      ok(messageRow),
      ok({ id: 'message_1' }),
      ok({ id: 'message_1' }),
    );
    const repository = new SupabaseDataRepository(harness.client, 'user_1');

    await expect(repository.listMessages({ limit: 25 })).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: '00000000-0000-4000-8000-000000000001',
          senderId: 'user_1',
        }),
      ],
      nextCursor: null,
    });
    await expect(repository.getMessage('message_1')).resolves.toMatchObject({
      subject: 'Hello',
    });
    await expect(
      repository.createMessage({
        recipientId: 'user_2',
        recipient: 'Teacher',
        subject: 'Hello',
        body: 'World',
      }),
    ).resolves.toMatchObject({ recipient: 'Teacher' });
    await expect(repository.markMessageRead('message_1')).resolves.toBe(true);
    await expect(repository.deleteMessage('message_1')).resolves.toBe(true);
  });

  it('returns null or false for inaccessible message records', async () => {
    const harness = clientHarness(ok(null), ok(null), ok(null));
    const repository = new SupabaseDataRepository(harness.client, 'user_1');

    await expect(repository.getMessage('missing')).resolves.toBeNull();
    await expect(repository.markMessageRead('missing')).resolves.toBe(false);
    await expect(repository.deleteMessage('missing')).resolves.toBe(false);
  });

  it('returns bounded message pages and applies an opaque cursor', async () => {
    const older = {
      ...messageRow,
      id: '00000000-0000-4000-8000-000000000000',
      created_at: '2026-07-29T00:00:00.000Z',
    };
    const harness = clientHarness(
      ok([messageRow, older]),
      ok([older]),
    );
    const repository = new SupabaseDataRepository(harness.client, 'user_1');

    const first = await repository.listMessages({ limit: 1 });
    expect(first.items).toHaveLength(1);
    expect(first.nextCursor).toEqual(expect.any(String));
    await expect(
      repository.listMessages({
        limit: 1,
        cursor: first.nextCursor!,
      }),
    ).resolves.toMatchObject({
      items: [expect.objectContaining({ id: older.id })],
      nextCursor: null,
    });
    expect(harness.calls).toContainEqual({
      operation: 'limit',
      args: [2],
    });
    expect(harness.calls.some(({ operation }) => operation === 'or')).toBe(
      true,
    );
  });

  it('maps notifications and supports own notification mutations', async () => {
    const harness = clientHarness(
      ok([notificationRow]),
      ok({ id: 'notification_1' }),
      ok(null),
      ok(userRow),
      ok(notificationRow),
    );
    const repository = new SupabaseDataRepository(harness.client, 'user_1');

    await expect(repository.listNotifications({ limit: 25 })).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: '00000000-0000-4000-8000-000000000002',
          type: 'info',
        }),
      ],
      nextCursor: null,
    });
    await expect(
      repository.markNotificationRead('notification_1'),
    ).resolves.toBe(true);
    await expect(repository.markAllNotificationsRead()).resolves.toBeUndefined();
    await expect(
      repository.createNotification({
        title: 'Notice',
        message: 'Hello',
        type: 'info',
        recipientId: 'user_1',
      }),
    ).resolves.toMatchObject({ userId: 'user_1' });
  });

  it('rejects a non-admin cross-user notification before insert', async () => {
    const harness = clientHarness(ok(userRow));
    const repository = new SupabaseDataRepository(harness.client, 'user_1');

    await expect(
      repository.createNotification({
        title: 'Notice',
        message: 'Private',
        type: 'warning',
        recipientId: 'user_2',
      }),
    ).rejects.toBeInstanceOf(ApplicationError);
    expect(harness.client.from).not.toHaveBeenCalled();
    expect(harness.client.rpc).toHaveBeenCalledOnce();
  });

  it('reads, creates, updates, and resets settings', async () => {
    const existing = clientHarness(ok(settingsRow));
    await expect(
      new SupabaseDataRepository(existing.client, 'user_1').getSettings(),
    ).resolves.toMatchObject({ language: 'English' });

    const created = clientHarness(ok({ ...settingsRow, id: 'settings_2' }));
    await expect(
      new SupabaseDataRepository(created.client, 'user_1').getSettings(),
    ).resolves.toMatchObject({ id: 'settings_2' });

    const updated = clientHarness(
      ok({ ...settingsRow, language: 'Spanish' }),
      ok(settingsRow),
    );
    const repository = new SupabaseDataRepository(updated.client, 'user_1');
    await expect(
      repository.updateSettings({
        language: 'Spanish',
        emailNotifications: false,
      }),
    ).resolves.toMatchObject({ language: 'Spanish' });
    await expect(repository.resetSettings()).resolves.toMatchObject({
      language: 'English',
    });
    expect(updated.client.rpc).toHaveBeenNthCalledWith(
      1,
      'upsert_current_settings',
      expect.objectContaining({ p_language: 'Spanish', p_reset: false }),
    );
    expect(updated.client.rpc).toHaveBeenNthCalledWith(
      2,
      'upsert_current_settings',
      expect.objectContaining({ p_reset: true }),
    );
  });

  it('maps active service list and lookup responses', async () => {
    const harness = clientHarness(ok([serviceRow]), ok(serviceRow), ok(null));
    const repository = new SupabaseDataRepository(harness.client, 'user_1');

    await expect(repository.listServices()).resolves.toEqual([
      expect.objectContaining({ id: 'storytelling', isActive: true }),
    ]);
    await expect(repository.getService('storytelling')).resolves.toMatchObject({
      name: 'Storytelling',
    });
    await expect(repository.getService('missing')).resolves.toBeNull();
  });

  it('maps constraint failures to conflict and redacts other database errors', async () => {
    await expect(
      new SupabaseDataRepository(
        clientHarness(failed('23505')).client,
        'user_1',
      ).listMessages({ limit: 25 }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    await expect(
      new SupabaseDataRepository(
        clientHarness(failed('XX000')).client,
        'user_1',
      ).listMessages({ limit: 25 }),
    ).rejects.toThrow('Supabase data operation failed (XX000)');
  });
});

describe('SupabaseIllustrationJobRepository', () => {
  it('maps enqueue, lookup, and atomic processing responses', async () => {
    const harness = clientHarness(
      ok(jobRow),
      ok(jobRow),
      ok({ ...jobRow, status: 'processing', attempts: 1 }),
    );
    const repository = new SupabaseIllustrationJobRepository(harness.client);

    await expect(
      repository.enqueue({
        ownerId: 'user_1',
        sessionId: 'session_1',
        idempotencyKey: 'turn_1',
        prompt: 'A safe story scene',
      }),
    ).resolves.toMatchObject({ id: 'job_1', status: 'pending' });
    await expect(
      repository.getForOwner('job_1', 'user_1'),
    ).resolves.toMatchObject({ ownerId: 'user_1' });
    await expect(
      repository.markProcessing('job_1', 'user_1'),
    ).resolves.toMatchObject({ status: 'processing', attempts: 1 });
  });

  it('returns null for inaccessible jobs and records completion/failure', async () => {
    const harness = clientHarness(ok(null), ok(null), ok(null));
    const repository = new SupabaseIllustrationJobRepository(harness.client);

    await expect(
      repository.getForOwner('missing', 'user_1'),
    ).resolves.toBeNull();
    await expect(
      repository.markCompleted(
        'job_1',
        'user_1',
        'https://img.test/completed.png',
      ),
    ).resolves.toBeUndefined();
    await expect(
      repository.markFailed('job_1', 'user_1', 'IMAGE_GENERATION_FAILED'),
    ).resolves.toBeUndefined();
  });

  it('rejects empty enqueue responses and propagates mutation errors safely', async () => {
    await expect(
      new SupabaseIllustrationJobRepository(
        clientHarness(ok(null)).client,
      ).enqueue({
        ownerId: 'user_1',
        sessionId: 'session_1',
        idempotencyKey: 'turn_1',
        prompt: 'A safe story scene',
      }),
    ).rejects.toThrow('Supabase returned no illustration job');

    await expect(
      new SupabaseIllustrationJobRepository(
        clientHarness(failed()).client,
      ).markFailed('job_1', 'user_1', 'IMAGE_GENERATION_FAILED'),
    ).rejects.toThrow('Supabase data operation failed (XX000)');
  });
});
