import type { FastifyBaseLogger, FastifyReply } from 'fastify';
import { ApplicationError } from './application-error.js';

export const safeErrorMetadata = (error: unknown) => ({
  errorType: error instanceof Error ? error.name : 'UnknownError',
});

export const sendPublicError = (
  reply: FastifyReply,
  logger: FastifyBaseLogger,
  error: unknown,
) => {
  if (error instanceof ApplicationError) {
    return reply.code(error.statusCode).send({ error: error.message });
  }

  logger.error(safeErrorMetadata(error), 'request failed');
  return reply.code(500).send({ error: 'INTERNAL_ERROR' });
};
