import { FastifyPluginAsync } from 'fastify';
import { getAuth } from '@clerk/fastify';

interface UserSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get user settings
  fastify.get('/', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch from your database
      const settings: UserSettings = {
        id: '1',
        userId,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        language: 'English',
        timezone: 'America/New_York'
      };
      
      return settings;
    /* c8 ignore start */
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
    /* c8 ignore stop */
  });
  
  // Update user settings
  fastify.patch('/', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    const updates = request.body as Partial<UserSettings>;
    
    try {
      // In a real app, you would update your database
      // For demo purposes, we'll return the updated settings
      const updatedSettings: UserSettings = {
        id: '1',
        userId,
        emailNotifications: updates.emailNotifications ?? true,
        smsNotifications: updates.smsNotifications ?? true,
        pushNotifications: updates.pushNotifications ?? false,
        language: updates.language ?? 'English',
        timezone: updates.timezone ?? 'America/New_York'
      };
      
      return {
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
      };
    /* c8 ignore start */
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
    /* c8 ignore stop */
  });
  
  // Reset user settings to defaults
  fastify.post('/reset', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would reset settings in your database
      const defaultSettings: UserSettings = {
        id: '1',
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: false,
        language: 'English',
        timezone: 'UTC'
      };
      
      return {
        success: true,
        message: 'Settings reset to defaults',
        data: defaultSettings
      };
    /* c8 ignore start */
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
    /* c8 ignore stop */
  });
};

export default settingsRoutes;
