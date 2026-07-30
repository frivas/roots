import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import {
  createIllustrationService,
  enqueueIllustration,
} from '../dependencies.js';
import { ApplicationError, notFound } from '../lib/application-error.js';
import { getRequestIdentity } from '../lib/auth.js';
import { sendPublicError } from '../lib/http.js';
import type { StoryIllustrationInput } from '../services/illustration-jobs.js';
import type { IllustrationJob } from '../types/application.js';
import type { BackendRouteOptions } from './options.js';
import { generationBodySchema } from './illustration-contract.js';

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
      const job = await enqueueIllustration(
        options.dependencies,
        fastify.log,
        {
          access: {
            userId: identity.userId,
            getToken: identity.getToken,
          },
          ownerId: identity.userId,
          sessionId: identity.sessionId,
          suppliedKey,
          story: request.body as StoryIllustrationInput,
        },
      );
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

  fastify.post(
    '/jobs/:id/recover',
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
        const job = await service.recover(id, identity.userId);
        if (!job) {
          throw notFound();
        }
        return reply.code(202).send(publicJob(job));
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );
};

export default imagesRoutes;
