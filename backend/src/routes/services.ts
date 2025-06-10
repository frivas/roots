import { FastifyPluginAsync } from 'fastify';
import { getAuth } from '@clerk/fastify';

const servicesRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Get all services
  fastify.get('/', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch from your database
      const services = [
        {
          id: 'classroom',
          name: 'Classroom Management',
          description: 'Manage morning classroom activities and attendance',
          isActive: true,
        },
        {
          id: 'transportation',
          name: 'Transportation',
          description: 'Track school transportation routes and schedules',
          isActive: true,
        },
        {
          id: 'cafeteria',
          name: 'Cafeteria Services',
          description: 'Meal planning and cafeteria service management',
          isActive: true,
        },
        {
          id: 'extracurricular',
          name: 'Extracurricular Activities',
          description: 'Register and manage after-school programs',
          isActive: true,
        },
        {
          id: 'language',
          name: 'Language Support',
          description: 'Language assistance programs for immigrant students',
          isActive: true,
        },
        {
          id: 'mentorship',
          name: 'Mentorship Program',
          description: 'Connect with mentors and manage mentorship relationships',
          isActive: true,
        }
      ];
      
      return services;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Get a specific service by ID
  fastify.get('/:id', async (request, reply) => {
    const { userId } = getAuth(request);
    const { id } = request.params as { id: string };
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch from your database
      const services = {
        classroom: {
          id: 'classroom',
          name: 'Classroom Management',
          description: 'Manage morning classroom activities and attendance',
          details: 'Full classroom management system including attendance tracking, behavior management, and activity scheduling.',
          isActive: true,
        },
        transportation: {
          id: 'transportation',
          name: 'Transportation',
          description: 'Track school transportation routes and schedules',
          details: 'Real-time bus tracking, route management, and driver assignment system.',
          isActive: true,
        },
        cafeteria: {
          id: 'cafeteria',
          name: 'Cafeteria Services',
          description: 'Meal planning and cafeteria service management',
          details: 'Menu planning, inventory management, and nutritional information tracking.',
          isActive: true,
        },
        extracurricular: {
          id: 'extracurricular',
          name: 'Extracurricular Activities',
          description: 'Register and manage after-school programs',
          details: 'Registration system for clubs, sports, and other after-school activities.',
          isActive: true,
        },
        language: {
          id: 'language',
          name: 'Language Support',
          description: 'Language assistance programs for immigrant students',
          details: 'ESL resources, translation services, and cultural integration programs.',
          isActive: true,
        },
        mentorship: {
          id: 'mentorship',
          name: 'Mentorship Program',
          description: 'Connect with mentors and manage mentorship relationships',
          details: 'Mentor matching, session scheduling, and progress tracking tools.',
          isActive: true,
        }
      };
      
      const service = services[id as keyof typeof services];
      
      if (!service) {
        return reply.code(404).send({ error: 'Service not found' });
      }
      
      return service;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};

export default servicesRoutes;