import type { FastifyRequest } from 'fastify';
import type { BackendDependencies } from '../dependencies.js';
import { getRequestIdentity } from '../lib/auth.js';

export interface BackendRouteOptions {
  dependencies: BackendDependencies;
}

export const getDataRepository = async (
  request: FastifyRequest,
  options: BackendRouteOptions,
) => {
  const identity = getRequestIdentity(request);
  return {
    identity,
    repository: await options.dependencies.repositories.data(
      identity.userId,
      identity.getToken,
    ),
  };
};
