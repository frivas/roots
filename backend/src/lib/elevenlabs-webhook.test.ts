import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyElevenLabsWebhook } from './elevenlabs-webhook.js';

const secret = 'webhook-test-secret';
const body = '{"event_id":"evt_1"}';
const now = Date.parse('2026-07-30T08:00:00.000Z');
const timestamp = Math.floor(now / 1_000);

const signature = (
  value: string,
  signedBody = body,
  signedSecret = secret,
) =>
  `t=${value},v0=${createHmac('sha256', signedSecret)
    .update(`${value}.${signedBody}`)
    .digest('hex')}`;

describe('verifyElevenLabsWebhook', () => {
  it('accepts an authentic signature over the exact raw body', () => {
    expect(() =>
      verifyElevenLabsWebhook(
        body,
        signature(String(timestamp)),
        secret,
        now,
      ),
    ).not.toThrow();
  });

  it.each([
    ['missing header', undefined],
    ['malformed header', 'not-a-signature'],
    ['wrong secret', signature(String(timestamp), body, 'other-secret')],
    ['altered body', signature(String(timestamp), '{"event_id":"evt_2"}')],
    ['non-hex signature', `t=${timestamp},v0=not-hex`],
  ])('rejects %s', (_label, header) => {
    expect(() =>
      verifyElevenLabsWebhook(body, header, secret, now),
    ).toThrow('INVALID_WEBHOOK_SIGNATURE');
  });

  it.each([
    ['stale', timestamp - 1_801],
    ['future', timestamp + 1_801],
  ])('rejects a %s timestamp outside the replay window', (_label, value) => {
    expect(() =>
      verifyElevenLabsWebhook(
        body,
        signature(String(value)),
        secret,
        now,
      ),
    ).toThrow('INVALID_WEBHOOK_SIGNATURE');
  });
});
