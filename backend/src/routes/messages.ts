import { FastifyPluginAsync } from 'fastify';
import { getAuth } from '@clerk/fastify';

interface Message {
  id: string;
  sender: string;
  senderId: string;
  recipient: string;
  recipientId: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
  starred: boolean;
}

const messagesRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Get all messages for the current user
  fastify.get('/', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch from your database
      const messages: Message[] = [
        {
          id: '1',
          sender: 'Principal García',
          senderId: 'user_123',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Staff Meeting Schedule Update',
          body: 'The weekly staff meeting has been moved to Thursday at 3:00 PM. Please make a note of this change in your calendar.',
          createdAt: '2025-01-15T14:30:00Z',
          read: true,
          starred: true
        },
        {
          id: '2',
          sender: 'Transportation Dept',
          senderId: 'user_456',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Bus Route Changes',
          body: 'Due to road construction, bus route #12 will be temporarily rerouted starting next Monday. Please inform affected students.',
          createdAt: '2025-01-14T09:15:00Z',
          read: false,
          starred: false
        },
        {
          id: '3',
          sender: 'Cafeteria Services',
          senderId: 'user_789',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'New Menu Options',
          body: 'We are excited to announce new vegetarian and gluten-free options in the cafeteria starting next week.',
          createdAt: '2025-01-13T11:45:00Z',
          read: false,
          starred: true
        },
        {
          id: '4',
          sender: 'IT Department',
          senderId: 'user_101',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'System Maintenance',
          body: 'The school management system will be offline for updates this Saturday from 10 PM to 2 AM.',
          createdAt: '2025-01-12T16:20:00Z',
          read: true,
          starred: false
        },
        {
          id: '5',
          sender: 'Extracurricular Coordinator',
          senderId: 'user_202',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Summer Program Registration',
          body: 'Registration for summer programs is now open. Space is limited, so please register early.',
          createdAt: '2025-01-11T10:00:00Z',
          read: true,
          starred: false
        },
        {
          id: '6',
          sender: 'Nurse Johnson',
          senderId: 'user_303',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Health Screening Reminder',
          body: 'Annual health screenings for all students are scheduled for next week. Please review the parent information packet.',
          createdAt: '2024-01-10T08:30:00Z',
          read: false,
          starred: false
        },
        {
          id: '7',
          sender: 'Library Services',
          senderId: 'user_404',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'New Books Available',
          body: 'We have received a new shipment of books including the latest educational materials for your grade level.',
          createdAt: '2024-01-09T13:15:00Z',
          read: true,
          starred: true
        },
        {
          id: '8',
          sender: 'Parent Association',
          senderId: 'user_505',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Volunteer Opportunities',
          body: 'The Parent Association is looking for volunteers for the upcoming spring fundraiser event.',
          createdAt: '2024-01-08T15:45:00Z',
          read: false,
          starred: false
        },
        {
          id: '9',
          sender: 'Art Department',
          senderId: 'user_606',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Art Exhibition Invitation',
          body: 'You are cordially invited to attend the student art exhibition this Friday evening at 6 PM.',
          createdAt: '2024-01-07T12:00:00Z',
          read: true,
          starred: false
        },
        {
          id: '10',
          sender: 'Security Office',
          senderId: 'user_707',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Updated Security Protocols',
          body: 'Please review the updated security protocols that will be implemented starting next month.',
          createdAt: '2024-01-06T10:30:00Z',
          read: false,
          starred: true
        },
        {
          id: '11',
          sender: 'Music Department',
          senderId: 'user_808',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Winter Concert Rehearsal',
          body: 'Reminder: Extra rehearsal for the winter concert is scheduled for this Saturday at 9 AM.',
          createdAt: '2024-01-05T14:20:00Z',
          read: true,
          starred: false
        },
        {
          id: '12',
          sender: 'Guidance Counselor',
          senderId: 'user_909',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Academic Planning Session',
          body: 'Please schedule an appointment to discuss your academic progress and future course selections.',
          createdAt: '2024-01-04T11:00:00Z',
          read: false,
          starred: false
        },
        {
          id: '13',
          sender: 'Sports Coordinator',
          senderId: 'user_111',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Basketball Season Schedule',
          body: 'The basketball season schedule has been finalized. Please check the dates for your team.',
          createdAt: '2024-01-03T16:45:00Z',
          read: true,
          starred: true
        },
        {
          id: '14',
          sender: 'Administrative Office',
          senderId: 'user_222',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Document Submission Deadline',
          body: 'Reminder: All required documents must be submitted by the end of this week.',
          createdAt: '2024-01-02T09:30:00Z',
          read: false,
          starred: false
        },
        {
          id: '15',
          sender: 'Technology Support',
          senderId: 'user_333',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'New Educational Software',
          body: 'We are excited to introduce new educational software tools that will enhance your learning experience.',
          createdAt: '2024-01-01T13:00:00Z',
          read: true,
          starred: false
        }
      ];
      
      return messages;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Get a specific message by ID
  fastify.get('/:id', async (request, reply) => {
    const { userId } = getAuth(request);
    const { id } = request.params as { id: string };
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would fetch from your database
      const messages: Record<string, Message> = {
        '1': {
          id: '1',
          sender: 'Principal García',
          senderId: 'user_123',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Staff Meeting Schedule Update',
          body: 'The weekly staff meeting has been moved to Thursday at 3:00 PM. Please make a note of this change in your calendar.\n\nWe will be discussing the upcoming semester plans and budget allocations. Please come prepared with any questions or concerns you may have.\n\nRegards,\nPrincipal García',
          createdAt: '2023-05-15T14:30:00Z',
          read: true,
          starred: true
        },
        '2': {
          id: '2',
          sender: 'Transportation Dept',
          senderId: 'user_456',
          recipient: 'John Doe',
          recipientId: userId,
          subject: 'Bus Route Changes',
          body: 'Due to road construction, bus route #12 will be temporarily rerouted starting next Monday. Please inform affected students.\n\nThe new route will add approximately 10 minutes to the travel time. Updated schedules will be distributed to students on Friday.\n\nThank you for your understanding,\nTransportation Department',
          createdAt: '2023-05-14T09:15:00Z',
          read: false,
          starred: false
        }
      };
      
      const message = messages[id];
      
      if (!message) {
        return reply.code(404).send({ error: 'Message not found' });
      }
      
      return message;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Send a new message
  fastify.post('/', async (request, reply) => {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    const { recipient, subject, body } = request.body as any;
    
    if (!recipient || !subject || !body) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }
    
    try {
      // In a real app, you would save to your database
      const newMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'John Doe',
        senderId: userId,
        recipient,
        recipientId: 'user_xyz', // In a real app, you would look up the recipient's ID
        subject,
        body,
        createdAt: new Date().toISOString(),
        read: false,
        starred: false
      };
      
      return {
        success: true,
        message: 'Message sent successfully',
        data: newMessage
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Mark a message as read
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
        message: 'Message marked as read'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
  
  // Delete a message
  fastify.delete('/:id', async (request, reply) => {
    const { userId } = getAuth(request);
    const { id } = request.params as { id: string };
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    
    try {
      // In a real app, you would delete from your database or mark as deleted
      return {
        success: true,
        message: 'Message deleted successfully'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};

export default messagesRoutes;