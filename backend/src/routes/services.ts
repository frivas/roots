import type { FastifyPluginAsync } from 'fastify';
import { notFound } from '../lib/application-error.js';
import { sendPublicError } from '../lib/http.js';
import {
  getDataRepository,
  type BackendRouteOptions,
} from './options.js';

const servicesRoutes: FastifyPluginAsync<BackendRouteOptions> = async (
  fastify,
  options,
) => {
  fastify.get('/', async (request, reply) => {
    try {
      const { repository } = await getDataRepository(request, options);
      return await repository.listServices();
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  });

  fastify.get(
    '/:id',
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
        const { repository } = await getDataRepository(request, options);
        const { id } = request.params as { id: string };
        const service = await repository.getService(id);
        if (!service) {
          throw notFound();
        }
        return service;
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );
};

export default servicesRoutes;
