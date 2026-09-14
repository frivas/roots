import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  dispatchServerlessRequest,
  getServerlessApp,
} from '../src/serverless-app.js';
import { randomUUID } from 'node:crypto';
import { safeErrorMetadata } from '../src/lib/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const fastify = await getServerlessApp();
    await dispatchServerlessRequest(fastify, req, res);
  } catch (error) {
    const requestId = randomUUID();
    process.stderr.write(
      `${JSON.stringify({
        level: 'error',
        event: 'serverless_request_failed',
        requestId,
        ...safeErrorMetadata(error),
      })}\n`,
    );
    if (!res.headersSent) {
      res.setHeader('x-request-id', requestId);
      res.status(503).json({ error: 'SERVICE_UNAVAILABLE' });
    }
  }
}
