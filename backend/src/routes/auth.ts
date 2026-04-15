import { FastifyPluginAsync } from 'fastify';
import { getAuth } from '@clerk/fastify';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Get current user info
  fastify.get('/user', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // You would typically fetch user data from your database here
      // For now, we'll return basic info from Clerk
      return {
        id: userId,
        // Additional user data would be fetched from your database
      };
    /* c8 ignore start */
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
    /* c8 ignore stop */
  });
  
  // Get user role
  fastify.get('/role', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch the user's role from your database
      // For demo purposes, we'll return a default role
      return {
        role: 'teacher',
      };
    /* c8 ignore start */
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
    /* c8 ignore stop */
  });
};

export default authRoutes;
