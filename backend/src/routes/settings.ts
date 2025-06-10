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

const settingsRoutes: FastifyPluginAsync = async (fastify, opts) => {
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
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
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
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
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
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};

export default settingsRoutes;