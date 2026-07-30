import { getAuth } from '@clerk/fastify';
import type { FastifyRequest } from 'fastify';
import { ApplicationError } from './application-error.js';

export interface RequestIdentity {
  userId: string;
  sessionId: string;
  getToken: () => Promise<string | null>;
}

export const getRequestIdentity = (request: FastifyRequest): RequestIdentity => {
  const auth = getAuth(request);
  if (!auth.userId || !auth.sessionId) {
    throw new ApplicationError('FORBIDDEN', 401, 'UNAUTHORIZED');
  }

  return {
    userId: auth.userId,
    sessionId: auth.sessionId,
    getToken: () => auth.getToken(),
  };
};
