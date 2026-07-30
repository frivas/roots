import type { FastifyPluginAsync } from 'fastify';
import { notFound } from '../lib/application-error.js';
import { sendPublicError } from '../lib/http.js';
import type { NotificationRecord } from '../types/application.js';
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

const notificationsRoutes: FastifyPluginAsync<BackendRouteOptions> = async (
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
          await repository.listNotifications(pageRequest),
          pageRequest.limit,
        );
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
        if (!(await repository.markNotificationRead(id))) {
          throw notFound();
        }
        return { success: true, message: 'Notification marked as read' };
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );

  fastify.patch('/read-all', async (request, reply) => {
    try {
      const { repository } = await getDataRepository(request, options);
      await repository.markAllNotificationsRead();
      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  });

  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'message', 'type', 'recipientId'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 300 },
            message: { type: 'string', minLength: 1, maxLength: 5_000 },
            type: {
              type: 'string',
              enum: ['error', 'info', 'success', 'warning'],
            },
            recipientId: { type: 'string', minLength: 1, maxLength: 128 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const notification = await repository.createNotification(
          request.body as {
            title: string;
            message: string;
            type: NotificationRecord['type'];
            recipientId: string;
          },
        );
        return reply.code(201).send({
          success: true,
          message: 'Notification created successfully',
          data: notification,
        });
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );
};

export default notificationsRoutes;
