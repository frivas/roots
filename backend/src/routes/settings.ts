import type { FastifyPluginAsync } from 'fastify';
import { sendPublicError } from '../lib/http.js';
import type { UserSettings } from '../types/application.js';
import {
  getDataRepository,
  type BackendRouteOptions,
} from './options.js';

const settingsRoutes: FastifyPluginAsync<BackendRouteOptions> = async (
  fastify,
  options,
) => {
  fastify.get('/', async (request, reply) => {
    try {
      const { repository } = await getDataRepository(request, options);
      return await repository.getSettings();
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  });

  fastify.patch(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          properties: {
            emailNotifications: { type: 'boolean' },
            smsNotifications: { type: 'boolean' },
            pushNotifications: { type: 'boolean' },
            language: { type: 'string', minLength: 2, maxLength: 50 },
            timezone: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { repository } = await getDataRepository(request, options);
        const updated = await repository.updateSettings(
          request.body as Partial<Omit<UserSettings, 'id' | 'userId'>>,
        );
        return {
          success: true,
          message: 'Settings updated successfully',
          data: updated,
        };
      } catch (error) {
        return sendPublicError(reply, fastify.log, error);
      }
    },
  );

  fastify.post('/reset', async (request, reply) => {
    try {
      const { repository } = await getDataRepository(request, options);
      const settings = await repository.resetSettings();
      return {
        success: true,
        message: 'Settings reset to defaults',
        data: settings,
      };
    } catch (error) {
      return sendPublicError(reply, fastify.log, error);
    }
  });
};

export default settingsRoutes;
