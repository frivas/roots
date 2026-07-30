import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import { createIllustrationService } from '../dependencies.js';
import { ApplicationError, notFound } from '../lib/application-error.js';
import { getRequestIdentity } from '../lib/auth.js';
import { sendPublicError } from '../lib/http.js';
import {
  buildIllustrationPrompt,
  deriveIdempotencyKey,
  type StoryIllustrationInput,
} from '../services/illustration-jobs.js';
import type { IllustrationJob } from '../types/application.js';
import type { BackendRouteOptions } from './options.js';

const generationBodySchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  properties: {
    prompt: { type: 'string', minLength: 1, maxLength: 4_000 },
    story_content: { type: 'string', minLength: 1, maxLength: 4_000 },
    characters: { type: 'string', minLength: 1, maxLength: 1_000 },
    setting: { type: 'string', minLength: 1, maxLength: 1_000 },
    mood: { type: 'string', minLength: 1, maxLength: 50 },
    current_scene: { type: 'string', minLength: 1, maxLength: 1_000 },
  },
  anyOf: [{ required: ['prompt'] }, { required: ['story_content'] }],
} as const;

const publicJob = (job: IllustrationJob) => ({
  jobId: job.id,
  status: job.status,
  imageUrl: job.imageUrl,
  errorCode: job.errorCode,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const imagesRoutes: FastifyPluginAsync<BackendRouteOptions> = async (
  fastify,
  options,
) => {
  const enqueue = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const identity = getRequestIdentity(request);
      const prompt = buildIllustrationPrompt(
        request.body as StoryIllustrationInput,
      );
      if (prompt.length > 4_000) {
        throw new ApplicationError(
          'VALIDATION_FAILED',
          400,
          'VALIDATION_FAILED',
        );
      }
      const suppliedKey = request.headers['idempotency-key'];
      if (
        suppliedKey !== undefined &&
        (typeof suppliedKey !== 'string' || suppliedKey.length > 128)
      ) {
        throw new ApplicationError(
          'VALIDATION_FAILED',
          400,
          'VALIDATION_FAILED',
        );
      }
      const service = await createIllustrationService(
        options.dependencies,
        fastify.log,
        {
          userId: identity.userId,
          getToken: identity.getToken,
        },
      );
      const job = await service.enqueue({
        ownerId: identity.userId,
        sessionId: identity.sessionId,
        idempotencyKey: deriveIdempotencyKey(
          identity.userId,
          identity.sessionId,
          prompt,
          suppliedKey,
        ),
        prompt,
      });
      return reply.code(202).send({
        ...publicJob(job),
        statusUrl: `/api/images/jobs/${job.id}`,
      });
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  };

  fastify.post(
    '/generate',
    { schema: { body: generationBodySchema } },
    enqueue,
  );
  fastify.post(
    '/generate-for-story',
    { schema: { body: generationBodySchema } },
    enqueue,
  );

  fastify.get(
    '/jobs/:id',
    {
      schema: {
        params: {
          type: 'object',
          additionalProperties: false,
          required: ['id'],
          properties: {
            id: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const identity = getRequestIdentity(request);
        const service = await createIllustrationService(
          options.dependencies,
          fastify.log,
          {
            userId: identity.userId,
            getToken: identity.getToken,
          },
        );
        const { id } = request.params as { id: string };
        const job = await service.get(id, identity.userId);
        if (!job) {
          throw notFound();
        }
        return publicJob(job);
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );
};

export default imagesRoutes;
