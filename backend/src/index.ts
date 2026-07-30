import { clerkPlugin } from '@clerk/fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import {
  createDefaultDependencies,
  enqueueIllustration,
  type BackendDependencies,
} from './dependencies.js';
import { getRequestIdentity } from './lib/auth.js';
import { verifyElevenLabsWebhook } from './lib/elevenlabs-webhook.js';
import { safeErrorMetadata, sendPublicError } from './lib/http.js';
import { getReleaseSha } from './lib/release-identity.js';
import authRoutes from './routes/auth.js';
import imagesRoutes from './routes/images.js';
import messagesRoutes from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import servicesRoutes from './routes/services.js';
import settingsRoutes from './routes/settings.js';
import { webhookIllustrationBodySchema } from './routes/illustration-contract.js';
import type { StoryIllustrationInput } from './services/illustration-jobs.js';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string;
  }
}

export interface BuildServerOptions {
  dependencies?: BackendDependencies;
  standalone?: boolean;
}

const required = (env: NodeJS.ProcessEnv, name: string) => {
  if (!env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
};

export const validateEnv = (
  env: NodeJS.ProcessEnv = process.env,
  { standalone = false, injectedDependencies = false } = {},
) => {
  if (standalone) {
    required(env, 'PORT');
  }
  required(env, 'CLERK_PUBLISHABLE_KEY');
  required(env, 'CLERK_SECRET_KEY');
  required(env, 'FRONTEND_URL');

  if (!injectedDependencies) {
    required(env, 'SUPABASE_URL');
    if (!env.SUPABASE_PUBLISHABLE_KEY && !env.SUPABASE_API_KEY) {
      throw new Error(
        'Missing required environment variable: SUPABASE_PUBLISHABLE_KEY',
      );
    }
    required(env, 'SUPABASE_SECRET_KEY');
    required(env, 'OPENAI_API_KEY');
    required(env, 'ELEVENLABS_WEBHOOK_SECRET');
  }
  getReleaseSha(env);
};

export const buildServer = async (options: BuildServerOptions = {}) => {
  validateEnv(process.env, {
    standalone: options.standalone,
    injectedDependencies: options.dependencies !== undefined,
  });
  const server = Fastify({
    logger:
      process.env.NODE_ENV === 'test'
        ? false
        : { level: process.env.LOG_LEVEL ?? 'info' },
    bodyLimit: 64 * 1024,
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
  });
  const dependencies = options.dependencies ?? createDefaultDependencies();
  const releaseSha = getReleaseSha();

  server.removeContentTypeParser('application/json');
  server.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (request, body, done) => {
      const rawBody = typeof body === 'string' ? body : body.toString('utf8');
      request.rawBody = rawBody;
      try {
        done(null, JSON.parse(rawBody));
      } catch {
        done(new Error('INVALID_JSON'));
      }
    },
  );

  await server.register(cors, {
    origin(origin, callback) {
      callback(
        null,
        origin === undefined || origin === process.env.FRONTEND_URL,
      );
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    exposedHeaders: ['x-next-cursor', 'x-page-limit', 'x-release-sha'],
  });
  await server.register(rateLimit, {
    max: 30,
    timeWindow: '1 minute',
  });
  await server.register(clerkPlugin, {
    secretKey: process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  });

  server.setErrorHandler((error: Error & {
    statusCode?: number;
    validation?: unknown;
  }, _request, reply) => {
    if (error.validation || error.message === 'INVALID_JSON') {
      return reply.code(400).send({ error: 'VALIDATION_FAILED' });
    }
    if (error.statusCode === 429) {
      return reply.code(429).send({ error: 'RATE_LIMITED' });
    }
    server.log.error(safeErrorMetadata(error), 'unhandled request failure');
    return reply.code(500).send({ error: 'INTERNAL_ERROR' });
  });

  server.get('/health', async (_request, reply) =>
    reply
      .header('x-release-sha', releaseSha)
      .send({ status: 'ok', releaseSha }),
  );
  server.get('/ready', async (_request, reply) => {
    const result = await dependencies.readiness.check();
    return reply.code(result.ready ? 200 : 503).send({
      status: result.ready ? 'ready' : 'not_ready',
      checks: result.checks,
    });
  });

  server.get('/events/story-illustrations', async (request, reply) => {
    try {
      const identity = getRequestIdentity(request);
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        Vary: 'Origin',
      });
      dependencies.eventRegistry.subscribe(
        identity.userId,
        identity.sessionId,
        reply.raw,
      );
      reply.raw.write(
        `data: ${JSON.stringify({ type: 'connected' })}\n\n`,
      );

      const heartbeat = setInterval(() => {
        reply.raw.write(': heartbeat\n\n');
      }, 30_000);
      reply.raw.on('close', () => {
        clearInterval(heartbeat);
        dependencies.eventRegistry.unsubscribe(
          identity.userId,
          identity.sessionId,
          reply.raw,
        );
      });
      return reply;
    } catch (error) {
      return sendPublicError(reply, server.log, error);
    }
  });

  server.post(
    '/webhook/elevenlabs/story-illustration',
    {
      schema: {
        body: webhookIllustrationBodySchema,
      },
    },
    async (request, reply) => {
      try {
        verifyElevenLabsWebhook(
          request.rawBody ?? '',
          request.headers['elevenlabs-signature'] as string | undefined,
          process.env.ELEVENLABS_WEBHOOK_SECRET,
        );
        const body = request.body as StoryIllustrationInput & {
          user_id: string;
          session_id: string;
          event_id: string;
        };
        const job = await enqueueIllustration(
          dependencies,
          server.log,
          {
            access: { trusted: true },
            ownerId: body.user_id,
            sessionId: body.session_id,
            suppliedKey: body.event_id,
            story: body,
          },
        );
        return reply.code(202).send({
          jobId: job.id,
          status: job.status,
        });
      } catch (error) {
        return sendPublicError(reply, server.log, error);
      }
    },
  );

  const routeOptions = { dependencies };
  await server.register(authRoutes, {
    prefix: '/api/auth',
    ...routeOptions,
  });
  await server.register(messagesRoutes, {
    prefix: '/api/messages',
    ...routeOptions,
  });
  await server.register(notificationsRoutes, {
    prefix: '/api/notifications',
    ...routeOptions,
  });
  await server.register(servicesRoutes, {
    prefix: '/api/services',
    ...routeOptions,
  });
  await server.register(settingsRoutes, {
    prefix: '/api/settings',
    ...routeOptions,
  });
  await server.register(imagesRoutes, {
    prefix: '/api/images',
    ...routeOptions,
  });

  return server;
};

const isMain =
  process.argv[1] != null &&
  (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('index.ts'));

/* c8 ignore next 5 */
if (isMain) {
  const server = await buildServer({ standalone: true });
  const port = Number(process.env.PORT);
  await server.listen({ port, host: '0.0.0.0' });
}
