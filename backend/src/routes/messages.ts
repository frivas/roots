import type { FastifyPluginAsync } from 'fastify';
import { notFound } from '../lib/application-error.js';
import { sendPublicError } from '../lib/http.js';
import {
  getDataRepository,
  type BackendRouteOptions,
} from './options.js';
import {
  getPageRequest,
  paginationQuerySchema,
  sendPage,
} from './pagination.js';

const idParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 128 },
  },
} as const;

const messagesRoutes: FastifyPluginAsync<BackendRouteOptions> = async (
  fastify,
  options,
) => {
  fastify.get(
    '/',
    { schema: { querystring: paginationQuerySchema } },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const pageRequest = getPageRequest(request.query);
        return sendPage(
          reply,
          await repository.listMessages(pageRequest),
          pageRequest.limit,
        );
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );

  fastify.get(
    '/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const { id } = request.params as { id: string };
        const message = await repository.getMessage(id);
        if (!message) {
          throw notFound();
        }
        return message;
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );

  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['recipientId', 'recipient', 'subject', 'body'],
          properties: {
            recipientId: { type: 'string', minLength: 1, maxLength: 128 },
            recipient: { type: 'string', minLength: 1, maxLength: 200 },
            subject: { type: 'string', minLength: 1, maxLength: 300 },
            body: { type: 'string', minLength: 1, maxLength: 20_000 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const input = request.body as {
          recipientId: string;
          recipient: string;
          subject: string;
          body: string;
        };
        const message = await repository.createMessage(input);
        return reply.code(201).send({
          success: true,
          message: 'Message sent successfully',
          data: message,
        });
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );

  fastify.patch(
    '/:id/read',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const { id } = request.params as { id: string };
        if (!(await repository.markMessageRead(id))) {
          throw notFound();
        }
        return { success: true, message: 'Message marked as read' };
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );

  fastify.delete(
    '/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const { id } = request.params as { id: string };
        if (!(await repository.deleteMessage(id))) {
          throw notFound();
        }
        return { success: true, message: 'Message deleted successfully' };
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );
};

export default messagesRoutes;
