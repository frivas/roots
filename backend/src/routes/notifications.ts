import { FastifyPluginAsync } from 'fastify';
import { getAuth } from '@clerk/fastify';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
}

const notificationsRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Get all notifications for the current user
  fastify.get('/', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch from your database
      const notifications: Notification[] = [
        {
          id: '1',
          title: 'System Maintenance',
          message: 'The platform will be undergoing maintenance tonight from 2:00 AM to 4:00 AM.',
          timestamp: '2023-05-15T14:30:00Z',
          type: 'info',
          read: false,
          userId
        },
        {
          id: '2',
          title: 'New Message Received',
          message: 'You have received a new message from Principal Johnson regarding the upcoming staff meeting.',
          timestamp: '2023-05-15T10:15:00Z',
          type: 'info',
          read: true,
          userId
        },
        {
          id: '3',
          title: 'Transportation Alert',
          message: 'Bus #103 will be running 15 minutes late today due to road construction.',
          timestamp: '2023-05-15T08:20:00Z',
          type: 'warning',
          read: false,
          userId
        },
        {
          id: '4',
          title: 'Successful Registration',
          message: 'Student Emily Johnson has been successfully registered for the summer language program.',
          timestamp: '2023-05-14T16:45:00Z',
          type: 'success',
          read: true,
          userId
        },
        {
          id: '5',
          title: 'Emergency Drill',
          message: 'Reminder: Fire drill scheduled for tomorrow at 10:30 AM. Please review safety procedures.',
          timestamp: '2023-05-14T11:10:00Z',
          type: 'error',
          read: false,
          userId
        }
      ];
      
      return notifications;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Mark a notification as read
  fastify.patch('/:id/read', async (request, reply) => {
    const { userId } = getAuth(request);
    const { id } = request.params as { id: string };
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would update your database
      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Mark all notifications as read
  fastify.patch('/read-all', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would update your database
      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Create a new notification (typically called by system processes)
  fastify.post('/', async (request, reply) => {
    // This would typically be an admin or system operation
    // For demo purposes, we're simplifying auth checks
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    const { title, message, type, recipientId } = request.body as any;
    
    if (!title || !message || !type || !recipientId) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }
    
    try {
      // In a real app, you would save to your database
      const newNotification = {
        id: Math.random().toString(36).substring(2, 11),
        title,
        message,
        timestamp: new Date().toISOString(),
        type,
        read: false,
        userId: recipientId
      };
      
      // In a real app, you would emit a socket event here
      
      return {
        success: true,
        message: 'Notification created successfully',
        data: newNotification
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};

export default notificationsRoutes;