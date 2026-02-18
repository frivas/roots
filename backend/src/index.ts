import 'dotenv/config';
import Fastify, { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { clerkPlugin, getAuth } from '@clerk/fastify';

// Routes
import authRoutes from './routes/auth.js';
import messagesRoutes from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import servicesRoutes from './routes/services.js';
import settingsRoutes from './routes/settings.js';
import imagesRoutes from './routes/images.js';

// Validate environment variables
function validateEnv() {
  const required = [
    'PORT',
    'CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'SUPABASE_URL',
    'SUPABASE_API_KEY',
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}
validateEnv();

// Create Fastify instance
const server = Fastify({ logger: true });

// Store SSE connections and make them accessible to routes
const sseConnections = new Set<any>();
server.decorate('sseConnections', sseConnections);

// Public health endpoint
server.get('/health', async () => ({ status: 'ok' }));

// SSE endpoint for story illustrations
server.get('/events/story-illustrations', async (request, reply) => {
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Add connection to our set
  sseConnections.add(reply.raw);

  // Send initial connection message
  reply.raw.write('data: {"type":"connected"}\n\n');

  // Clean up on disconnect
  reply.raw.on('close', () => {
    sseConnections.delete(reply.raw);
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    reply.raw.write(': heartbeat\n\n');
  }, 30000);

  reply.raw.on('close', () => {
    clearInterval(keepAlive);
  });
});

// Public webhook endpoints (no auth required)
server.register(async function publicWebhooks(fastify) {
  // ElevenLabs webhook for story illustrations
  fastify.post('/webhook/elevenlabs/story-illustration', async (request, reply) => {
    try {
      const { 
        story_content, 
        characters, 
        setting, 
        mood, 
        current_scene 
      } = request.body as { 
        story_content?: string;
        characters?: string;
        setting?: string;
        mood?: string;
        current_scene?: string;
      };

      // 🎯 SEND GENERATION START EVENT FIRST
      const startEventData = JSON.stringify({
        type: 'generation-started',
        data: {
          message: 'Starting image generation...',
          context: { story_content, characters, setting, mood, current_scene }
        }
      });

      sseConnections.forEach((connection) => {
        try {
          connection.write(`data: ${startEventData}\n\n`);
          console.log('📡 Sent generation-started event to frontend');
        } catch (error) {
          console.error('Error sending generation-started SSE:', error);
          sseConnections.delete(connection);
        }
      });

      // Import OpenAI dynamically
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Generate contextual prompt based on story elements
      const generateContextualPrompt = () => {
        const baseStyle = "Children's book illustration, cartoon style, vibrant colors, friendly and approachable";
        
        const moodStyles = {
          happy: "bright and cheerful colors, sunny atmosphere, smiling characters",
          scary: "dramatic lighting, mysterious shadows, but still child-appropriate and not too frightening",
          sad: "soft, muted colors, gentle expressions, comforting atmosphere",
          magical: "sparkles, glowing effects, enchanted atmosphere, mystical elements",
          adventurous: "dynamic composition, action poses, exciting landscape, bold colors",
          cheerful: "warm colors, pleasant lighting, joyful expressions"
        };

        const characterDesc = characters 
          ? `featuring ${characters}`
          : 'with charming storybook characters';

        const sceneDesc = current_scene 
          ? `showing ${current_scene.substring(0, 100)}`
          : 'in an engaging story scene';

        const settingDesc = setting || 'in a magical storybook world';
        const selectedMoodStyle = moodStyles[mood as keyof typeof moodStyles] || moodStyles.cheerful;

        const prompt = `${baseStyle}, ${selectedMoodStyle}, 
          set in ${settingDesc}, ${characterDesc}, ${sceneDesc}. 
          Perfect for children ages 4-10, safe and wholesome content, high quality digital art.`;

        return prompt.replace(/\s+/g, ' ').trim();
      };

      const contextualPrompt = generateContextualPrompt();

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: contextualPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      if (!response.data || !response.data[0]?.url) {
        throw new Error('No image URL returned from OpenAI');
      }
      const imageUrl = response.data[0].url;

      // Broadcast the image to all connected SSE clients
      const eventData = JSON.stringify({
        type: 'story-illustration',
        data: {
          imageUrl,
          context: {
            story_content,
            characters,
            setting,
            mood,
            current_scene
          }
        }
      });

      sseConnections.forEach((connection) => {
        try {
          connection.write(`data: ${eventData}\n\n`);
        } catch (error) {
          console.error('Error sending SSE message:', error);
          sseConnections.delete(connection);
        }
      });

      reply.send({ 
        success: true,
        image_url: imageUrl,
        message: "I've created a beautiful illustration for your story! The image shows the scene with all the characters and details from our story."
      });
    } catch (error) {
      console.error('Image generation error:', error);
      reply.status(500).send({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
        message: "I'm sorry, I couldn't create the illustration right now. Let's continue with our story!"
      });
    }
  });

  // Test endpoint
  fastify.get('/webhook/test', async (request, reply) => {
    reply.send({ 
      message: 'Webhook endpoint is working!', 
      timestamp: new Date().toISOString(),
      ngrok_working: true 
    });
  });
});

// Public middleware
await server.register(cors, {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
});
await server.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Protected routes encapsulated as an async plugin
const protectedRoutes: FastifyPluginAsync = async (app) => {
  // Initialize Clerk authentication
  app.register(clerkPlugin, {
    secretKey:      process.env.CLERK_SECRET_KEY!,   
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  });

  // Register authenticated route modules
  await app.register(authRoutes,          { prefix: '/api/auth' });
  await app.register(messagesRoutes,      { prefix: '/api/messages' });
  await app.register(notificationsRoutes, { prefix: '/api/notifications' });
  await app.register(servicesRoutes,      { prefix: '/api/services' });
  await app.register(settingsRoutes,      { prefix: '/api/settings' });
  await app.register(imagesRoutes,        { prefix: '/api/images' });
};

// Register the protected plugin
await server.register(protectedRoutes);

// Start the server
const PORT = Number(process.env.PORT);
await server.listen({ port: PORT, host: '0.0.0.0' });