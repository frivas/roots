import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApplicationError } from './application-error.js';

const DEFAULT_TOLERANCE_SECONDS = 30 * 60;

const parseSignatureHeader = (header: string) => {
  const values = new Map(
    header.split(',').map((part) => {
      const [key, value] = part.trim().split('=', 2);
      return [key, value] as const;
    }),
  );
  const timestamp = values.get('t');
  const signature = values.get('v0');
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) {
    throw new ApplicationError('FORBIDDEN', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }
  return { timestamp, signature };
};
export const verifyElevenLabsWebhook = (
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string | undefined,
  now = Date.now(),
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
) => {
  if (!signatureHeader || !secret) {
    throw new ApplicationError('FORBIDDEN', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }

  const { timestamp, signature } = parseSignatureHeader(signatureHeader);
  const timestampMilliseconds = Number(timestamp) * 1_000;
  if (
    !Number.isSafeInteger(timestampMilliseconds) ||
    Math.abs(now - timestampMilliseconds) > toleranceSeconds * 1_000
  ) {
    throw new ApplicationError('FORBIDDEN', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, 'hex');
  } catch {
    throw new ApplicationError('FORBIDDEN', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new ApplicationError('FORBIDDEN', 401, 'INVALID_WEBHOOK_SIGNATURE');
  }
};
