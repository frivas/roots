import type { FastifyBaseLogger } from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => ({
  createRequestSupabase: vi.fn(),
  createTrustedSupabase: vi.fn(),
}));
const openAIMocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  generate: vi.fn(async () => ({
    data: [{ url: 'https://img.test/default.png' }],
  })),
}));
const vercelMocks = vi.hoisted(() => ({
  waitUntil: vi.fn(),
}));

vi.mock('./lib/supabase.js', () => supabaseMocks);
vi.mock('@vercel/functions', () => vercelMocks);
vi.mock('openai', () => ({
  default: class {
    images = { generate: openAIMocks.generate };

    constructor(options: unknown) {
      openAIMocks.constructor(options);
    }
  },
}));

import {
  createDefaultDependencies,
  createIllustrationService,
  enqueueIllustration,
} from './dependencies.js';
import {
  SupabaseDataRepository,
  SupabaseIllustrationJobRepository,
} from './repositories/supabase-repository.js';
import type {
  IllustrationJobRepository,
  RepositoryFactory,
} from './repositories/contracts.js';
import type { IllustrationJob } from './types/application.js';

const logger = {
  error: vi.fn(),
} as unknown as FastifyBaseLogger;

const readinessClient = (error: { message: string } | null = null) => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(async () => ({ data: error ? null : { id: 1 }, error })),
      })),
    })),
  })),
});

const pendingJob = (overrides: Partial<IllustrationJob> = {}): IllustrationJob => ({
  id: 'job_1',
  ownerId: 'user_1',
  sessionId: 'session_1',
  idempotencyKey: 'turn_1',
  prompt: 'A safe story scene',
  status: 'pending',
  imageUrl: null,
  errorCode: null,
  attempts: 0,
  createdAt: '2026-07-30T00:00:00.000Z',
  updatedAt: '2026-07-30T00:00:00.000Z',
  ...overrides,
});

describe('default backend dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    supabaseMocks.createRequestSupabase.mockReturnValue(readinessClient());
    supabaseMocks.createTrustedSupabase.mockReturnValue({ trusted: true });
  });

  it('constructs request-scoped and trusted repositories with the right clients', async () => {
    const dependencies = createDefaultDependencies();
    const getToken = vi.fn(async () => 'clerk-token');

    const data = await dependencies.repositories.data('user_1', getToken);
    const jobs = await dependencies.repositories.illustrationJobs(
      'user_1',
      getToken,
    );
    const trusted = await dependencies.repositories.trustedIllustrationJobs();

    expect(data).toBeInstanceOf(SupabaseDataRepository);
    expect(jobs).toBeInstanceOf(SupabaseIllustrationJobRepository);
    expect(trusted).toBeInstanceOf(SupabaseIllustrationJobRepository);
    expect(supabaseMocks.createRequestSupabase).toHaveBeenNthCalledWith(
      1,
      getToken,
    );
    expect(supabaseMocks.createRequestSupabase).toHaveBeenNthCalledWith(
      2,
      getToken,
    );
    expect(supabaseMocks.createTrustedSupabase).toHaveBeenCalledOnce();
    expect(dependencies.eventPublisher).toBe(dependencies.eventRegistry);
  });

  it('reports readiness from configuration and the real health-check query', async () => {
    const dependencies = createDefaultDependencies();

    await expect(dependencies.readiness.check()).resolves.toEqual({
      ready: true,
      checks: { clerk: 'ok', openai: 'ok', supabase: 'ok' },
    });

    supabaseMocks.createRequestSupabase.mockReturnValueOnce(
      readinessClient({ message: 'unavailable' }),
    );
    await expect(createDefaultDependencies().readiness.check()).resolves.toEqual({
      ready: false,
      checks: { clerk: 'ok', openai: 'ok', supabase: 'unavailable' },
    });
  });

  it('runs scheduled work and lazily reuses the OpenAI client', async () => {
    const dependencies = createDefaultDependencies();
    const scheduled = vi.fn(async () => undefined);

    dependencies.scheduler(scheduled);
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    await dependencies.illustrationProvider.generate('first prompt');
    await dependencies.illustrationProvider.generate('second prompt');

    expect(scheduled).toHaveBeenCalledOnce();
    expect(openAIMocks.constructor).toHaveBeenCalledOnce();
    expect(openAIMocks.generate).toHaveBeenCalledTimes(2);
  });

  it('extends scheduled job lifetime on Vercel', async () => {
    vi.stubEnv('VERCEL', '1');
    const scheduled = vi.fn(async () => undefined);

    createDefaultDependencies().scheduler(scheduled);

    expect(vercelMocks.waitUntil).toHaveBeenCalledOnce();
    await expect(vercelMocks.waitUntil.mock.calls[0]![0]).resolves.toBeUndefined();
    expect(scheduled).toHaveBeenCalledOnce();
  });
});

describe('illustration dependency composition', () => {
  const repository: IllustrationJobRepository = {
    enqueue: vi.fn(async () => pendingJob()),
    getForOwner: vi.fn(async () => pendingJob()),
    markProcessing: vi.fn(async () => null),
    markCompleted: vi.fn(async () => undefined),
    markFailed: vi.fn(async () => undefined),
  };
  const repositories: RepositoryFactory = {
    data: vi.fn(),
    illustrationJobs: vi.fn(async () => repository),
    trustedIllustrationJobs: vi.fn(async () => repository),
  };
  const dependencies = {
    ...createDefaultDependencies(),
    repositories,
    scheduler: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects the request or trusted repository for the service boundary', async () => {
    const getToken = vi.fn(async () => 'clerk-token');

    await createIllustrationService(dependencies, logger, {
      userId: 'user_1',
      getToken,
    });
    await createIllustrationService(dependencies, logger, { trusted: true });

    expect(repositories.illustrationJobs).toHaveBeenCalledWith(
      'user_1',
      getToken,
    );
    expect(repositories.trustedIllustrationJobs).toHaveBeenCalledOnce();
  });

  it('uses one enqueue command for trusted and authenticated ingress', async () => {
    const getToken = vi.fn(async () => 'clerk-token');

    const authenticated = await enqueueIllustration(dependencies, logger, {
      access: { userId: 'user_1', getToken },
      ownerId: 'user_1',
      sessionId: 'session_1',
      suppliedKey: 'turn_1',
      story: { prompt: '  A safe story scene  ' },
    });
    const trusted = await enqueueIllustration(dependencies, logger, {
      access: { trusted: true },
      ownerId: 'user_1',
      sessionId: 'session_1',
      suppliedKey: 'turn_1',
      story: { prompt: 'A safe story scene' },
    });

    expect(authenticated).toMatchObject({ id: 'job_1' });
    expect(trusted).toMatchObject({ id: 'job_1' });
    expect(repository.enqueue).toHaveBeenCalledTimes(2);
    expect(repository.enqueue).toHaveBeenCalledWith({
      ownerId: 'user_1',
      sessionId: 'session_1',
      idempotencyKey: 'turn_1',
      prompt: 'A safe story scene',
    });
  });
});
