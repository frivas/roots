import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServerlessApp } from '../src/serverless-app.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getServerlessApp();
  fastify.server.emit('request', req, res);
}
