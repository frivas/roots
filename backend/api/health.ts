import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getReleaseSha } from '../src/lib/release-identity.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  if (origin && origin === process.env.FRONTEND_URL) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  try {
    const releaseSha = getReleaseSha();
    res.setHeader('x-release-sha', releaseSha);
    res.status(200).json({ status: 'ok', releaseSha });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
}
