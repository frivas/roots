import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  dispatchServerlessRequest,
  getServerlessApp,
} from '../src/serverless-app.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fastify = await getServerlessApp();
  await dispatchServerlessRequest(fastify, req, res);
}
