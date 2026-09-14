import type { FastifyBaseLogger } from 'fastify';
import type OpenAI from 'openai';
import { waitUntil } from '@vercel/functions';
import {
  createRequestSupabase,
  createTrustedSupabase,
} from './lib/supabase.js';
import type { RepositoryFactory } from './repositories/contracts.js';
import {
  ApplicationError,
  demoModeUnavailable,
} from './lib/application-error.js';
import {
  DemoDataRepository,
  DemoIllustrationJobRepository,
} from './repositories/demo-repository.js';
import {
  SupabaseDataRepository,
  SupabaseIllustrationJobRepository,
} from './repositories/supabase-repository.js';
import {
  IllustrationJobService,
  OpenAIImageProvider,
  buildIllustrationPrompt,
  deriveIdempotencyKey,
  type IllustrationProvider,
  type JobScheduler,
  type StoryIllustrationInput,
} from './services/illustration-jobs.js';

interface ReadinessResult {
  ready: boolean;
  checks: {
    clerk: 'configured' | 'unavailable';
    openai: 'configured' | 'disabled' | 'unavailable';
    supabase: 'available' | 'disabled' | 'unavailable';
  };
}

interface ReadinessChecker {
  check(): Promise<ReadinessResult>;
}

export interface BackendDependencies {
  mode: 'connected' | 'demo';
  repositories: RepositoryFactory;
  illustrationProvider: IllustrationProvider;
  scheduler: JobScheduler;
  readiness: ReadinessChecker;
}

let openAIClient: OpenAI | null = null;

const getOpenAI = async () => {
  if (!openAIClient) {
    const { default: OpenAIClass } = await import('openai');
    openAIClient = new OpenAIClass({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 0,
      timeout: 20_000,
    });
  }
  return openAIClient;
};

const defaultScheduler: JobScheduler = (task) => {
  if (process.env.VERCEL === '1') {
    waitUntil(Promise.resolve().then(task));
    return;
  }
  queueMicrotask(() => {
    void task();
  });
};

const createDefaultReadiness = (): ReadinessChecker => ({
  async check() {
    const checks: ReadinessResult['checks'] = {
      clerk:
        process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
          ? 'configured'
          : 'unavailable',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'unavailable',
      supabase: 'unavailable',
    };

    try {
      const client = createRequestSupabase(async () => null);
      const { error } = await client
        .from('health_checks')
        .select('id')
        .eq('id', 1)
        .single();
      checks.supabase = error ? 'unavailable' : 'available';
    } catch {
      checks.supabase = 'unavailable';
    }

    return {
      ready:
        checks.clerk === 'configured' &&
        checks.openai === 'configured' &&
        checks.supabase === 'available',
      checks,
    };
  },
});

export const createDefaultDependencies = (): BackendDependencies => {
  const repositories: RepositoryFactory = {
    async data(userId, getToken) {
      return new SupabaseDataRepository(
        createRequestSupabase(getToken),
        userId,
      );
    },
    async illustrationJobs(_userId, getToken) {
      return new SupabaseIllustrationJobRepository(
        createRequestSupabase(getToken),
      );
    },
    async trustedIllustrationJobs() {
      return new SupabaseIllustrationJobRepository(createTrustedSupabase());
    },
  };

  return {
    mode: 'connected',
    repositories,
    illustrationProvider: new OpenAIImageProvider(getOpenAI),
    scheduler: defaultScheduler,
    readiness: createDefaultReadiness(),
  };
};

export const createDemoDependencies = (): BackendDependencies => {
  const illustrationJobs = new DemoIllustrationJobRepository();
  return {
    mode: 'demo',
    repositories: {
      async data(userId) {
        return new DemoDataRepository(userId);
      },
      async illustrationJobs() {
        return illustrationJobs;
      },
      async trustedIllustrationJobs() {
        return illustrationJobs;
      },
    },
    illustrationProvider: {
      async generate() {
        throw demoModeUnavailable();
      },
    },
    scheduler() {},
    readiness: {
      async check() {
        return {
          ready: true,
          checks: {
            clerk: 'configured',
            openai: 'disabled',
            supabase: 'disabled',
          },
        };
      },
    },
  };
};

export const createIllustrationService = async (
  dependencies: BackendDependencies,
  logger: FastifyBaseLogger,
  input:
    | {
        trusted: true;
      }
    | {
        trusted?: false;
        userId: string;
        getToken: () => Promise<string | null>;
      },
) => {
  const repository = input.trusted
    ? await dependencies.repositories.trustedIllustrationJobs()
    : await dependencies.repositories.illustrationJobs(
        input.userId,
        input.getToken,
      );

  return new IllustrationJobService(
    repository,
    dependencies.illustrationProvider,
    dependencies.scheduler,
    logger,
  );
};

export const enqueueIllustration = async (
  dependencies: BackendDependencies,
  logger: FastifyBaseLogger,
  input: {
    access:
      | { trusted: true }
      | {
          trusted?: false;
          userId: string;
          getToken: () => Promise<string | null>;
        };
    ownerId: string;
    sessionId: string;
    suppliedKey?: string;
    story: StoryIllustrationInput;
  },
) => {
  const prompt = buildIllustrationPrompt(input.story);
  if (prompt.length > 4_000) {
    throw new ApplicationError('VALIDATION_FAILED', 400, 'VALIDATION_FAILED');
  }
  const service = await createIllustrationService(
    dependencies,
    logger,
    input.access,
  );
  return service.enqueue({
    ownerId: input.ownerId,
    sessionId: input.sessionId,
    idempotencyKey: deriveIdempotencyKey(
      input.ownerId,
      input.sessionId,
      prompt,
      input.suppliedKey,
    ),
    prompt,
  });
};
