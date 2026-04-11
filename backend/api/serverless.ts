import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildServer } from '../src/index.js';

let app: Awaited<ReturnType<typeof buildServer>> | null = null;

const getApp = async () => {
  if (!app) {
    app = await buildServer();
    await app.ready();
  }
  return app;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getApp();
  fastify.server.emit('request', req, res);
}
