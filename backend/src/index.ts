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

// Public health endpoint
server.get('/health', async () => ({ status: 'ok' }));

// Public middleware
await server.register(cors, { origin: process.env.FRONTEND_URL });
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
};

// Register the protected plugin
await server.register(protectedRoutes);

// Start the server
const PORT = Number(process.env.PORT);
await server.listen({ port: PORT, host: '0.0.0.0' });