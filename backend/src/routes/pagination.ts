import type { FastifyReply } from 'fastify';
import type { PageRequest, PageResult } from '../repositories/contracts.js';

export const paginationQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    cursor: { type: 'string', minLength: 1, maxLength: 512 },
  },
} as const;

export const getPageRequest = (query: unknown): PageRequest => {
  const page = query as { limit?: number; cursor?: string };
  return {
    limit: page.limit ?? 25,
    ...(page.cursor ? { cursor: page.cursor } : {}),
  };
};

export const sendPage = <T>(
  reply: FastifyReply,
  page: PageResult<T>,
  limit: number,
) => {
  reply.header('x-page-limit', String(limit));
  if (page.nextCursor) {
    reply.header('x-next-cursor', page.nextCursor);
  }
  return reply.send(page.items);
};
