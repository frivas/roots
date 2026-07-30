import { ApplicationError } from '../lib/application-error.js';

interface CursorValue {
  createdAt: string;
  id: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const invalidCursor = () =>
  new ApplicationError('VALIDATION_FAILED', 400, 'VALIDATION_FAILED');

export const encodeCursor = (value: CursorValue) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

export const decodeCursor = (cursor: string): CursorValue => {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as Partial<CursorValue>;
    if (
      typeof parsed.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(parsed.createdAt)) ||
      typeof parsed.id !== 'string' ||
      !UUID_PATTERN.test(parsed.id)
    ) {
      throw invalidCursor();
    }
    return {
      createdAt: new Date(parsed.createdAt).toISOString(),
      id: parsed.id,
    };
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    throw invalidCursor();
  }
};
