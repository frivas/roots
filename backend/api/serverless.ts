import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { clerkPlugin } from '@clerk/fastify';

// Define proper type for SSE connection
type SSEConnection = NodeJS.WritableStream;

// Routes
import authRoutes from '../src/routes/auth.js';
import messagesRoutes from '../src/routes/messages.js';
import notificationsRoutes from '../src/routes/notifications.js';
import servicesRoutes from '../src/routes/services.js';
import settingsRoutes from '../src/routes/settings.js';
import imagesRoutes from '../src/routes/images.js';

// Validate environment variables
function validateEnv() {
    const required = [
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

// Create Fastify instance for serverless
const createApp = async () => {
    validateEnv();

    const app = Fastify({ logger: false }); // Disable logging for serverless

    // Store SSE connections
    const sseConnections = new Set<SSEConnection>();
    app.decorate('sseConnections', sseConnections);

    // Public health endpoint
    app.get('/health', async () => ({ status: 'ok' }));

    // SSE endpoint for story illustrations
    app.get('/events/story-illustrations', async (request, reply) => {
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        sseConnections.add(reply.raw);
        reply.raw.write('data: {"type":"connected"}\n\n');

        reply.raw.on('close', () => {
            sseConnections.delete(reply.raw);
        });

        const keepAlive = setInterval(() => {
            reply.raw.write(': heartbeat\n\n');
        }, 30000);

        reply.raw.on('close', () => {
            clearInterval(keepAlive);
        });
    });

    // Public webhook endpoints
    app.register(async function publicWebhooks(fastify) {
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

                // Generate image (simplified for serverless)
                const response = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: `Children's book illustration for: ${story_content}`,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard",
                    style: "vivid"
                });

                if (!response.data || !response.data[0]?.url) {
                    throw new Error('No image URL returned from OpenAI');
                }
                const imageUrl = response.data[0].url;

                const eventData = JSON.stringify({
                    type: 'story-illustration',
                    data: {
                        imageUrl,
                        context: { story_content, characters, setting, mood, current_scene }
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
                    message: "I've created a beautiful illustration for your story!"
                });
            } catch (error) {
                console.error('Image generation error:', error);
                reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to generate image',
                    message: "I'm sorry, I couldn't create the illustration right now."
                });
            }
        });

        fastify.get('/webhook/test', async (request, reply) => {
            reply.send({
                message: 'Webhook endpoint is working!',
                timestamp: new Date().toISOString(),
                serverless: true
            });
        });
    });

    // Middleware
    await app.register(cors, {
        origin: process.env.FRONTEND_URL || true
    });

    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute'
    });

    // Protected routes
    await app.register(async function protectedRoutes(fastify) {
        await fastify.register(clerkPlugin, {
            secretKey: process.env.CLERK_SECRET_KEY!,
            publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
        });

        await fastify.register(authRoutes, { prefix: '/api/auth' });
        await fastify.register(messagesRoutes, { prefix: '/api/messages' });
        await fastify.register(notificationsRoutes, { prefix: '/api/notifications' });
        await fastify.register(servicesRoutes, { prefix: '/api/services' });
        await fastify.register(settingsRoutes, { prefix: '/api/settings' });
        await fastify.register(imagesRoutes, { prefix: '/api/images' });
    });

    await app.ready();
    return app;
};

let app: FastifyInstance | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!app) {
        app = await createApp();
    }

    await app.ready();
    app.server.emit('request', req, res);
}
