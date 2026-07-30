import type { FastifyPluginAsync } from 'fastify';
import { sendPublicError } from '../lib/http.js';
import {
  getDataRepository,
  type BackendRouteOptions,
} from './options.js';

const authRoutes: FastifyPluginAsync<BackendRouteOptions> = async (
  fastify,
  options,
) => {
  fastify.get('/user', async (request, reply) => {
    try {
      const { repository } = await getDataRepository(request, options);
      return await repository.getCurrentUser();
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  });

  fastify.get('/role', async (request, reply) => {
    try {
      const { repository } = await getDataRepository(request, options);
      const user = await repository.getCurrentUser();
      return { role: user.role };
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  });
};

export default authRoutes;
