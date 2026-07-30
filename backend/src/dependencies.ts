import type { FastifyBaseLogger } from 'fastify';
import type OpenAI from 'openai';
import {
  createRequestSupabase,
  createTrustedSupabase,
} from './lib/supabase.js';
import type { RepositoryFactory } from './repositories/contracts.js';
import {
  SupabaseDataRepository,
  SupabaseIllustrationJobRepository,
} from './repositories/supabase-repository.js';
import {
  IllustrationJobService,
  OpenAIImageProvider,
  type IllustrationEventPublisher,
  type IllustrationProvider,
  type JobScheduler,
} from './services/illustration-jobs.js';
import { SessionEventRegistry } from './services/session-events.js';

export interface ReadinessResult {
  ready: boolean;
  checks: {
    clerk: 'ok' | 'unavailable';
    openai: 'ok' | 'unavailable';
    supabase: 'ok' | 'unavailable';
  };
}

export interface ReadinessChecker {
  check(): Promise<ReadinessResult>;
}

export interface BackendDependencies {
  repositories: RepositoryFactory;
  illustrationProvider: IllustrationProvider;
  eventPublisher: IllustrationEventPublisher;
  eventRegistry: SessionEventRegistry;
  scheduler: JobScheduler;
  readiness: ReadinessChecker;
}

let openAIClient: OpenAI | null = null;

const getOpenAI = async () => {
  if (!openAIClient) {
    const { default: OpenAIClass } = await import('openai');
    openAIClient = new OpenAIClass({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openAIClient;
};

const defaultScheduler: JobScheduler = (task) => {
  queueMicrotask(() => {
    void task();
  });
};

const createDefaultReadiness = (): ReadinessChecker => ({
  async check() {
    const checks: ReadinessResult['checks'] = {
      clerk:
        process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
          ? 'ok'
          : 'unavailable',
      openai: process.env.OPENAI_API_KEY ? 'ok' : 'unavailable',
      supabase: 'unavailable',
    };

    try {
      const client = createRequestSupabase(async () => null);
      const { error } = await client
        .from('health_checks')
        .select('id')
        .eq('id', 1)
        .single();
      checks.supabase = error ? 'unavailable' : 'ok';
    } catch {
      checks.supabase = 'unavailable';
    }

    return {
      ready: Object.values(checks).every((status) => status === 'ok'),
      checks,
    };
  },
});

export const createDefaultDependencies = (): BackendDependencies => {
  const eventRegistry = new SessionEventRegistry();
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
    repositories,
    illustrationProvider: new OpenAIImageProvider(getOpenAI),
    eventPublisher: eventRegistry,
    eventRegistry,
    scheduler: defaultScheduler,
    readiness: createDefaultReadiness(),
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
    dependencies.eventPublisher,
    dependencies.scheduler,
    logger,
  );
};
