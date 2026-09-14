import {
  buildServer,
  type BuildServerOptions,
} from './index.js';
import type { FastifyInstance } from 'fastify';
import type { IncomingMessage, ServerResponse } from 'node:http';

let appPromise: Promise<Awaited<ReturnType<typeof buildServer>>> | null = null;

export const getServerlessApp = async (options: BuildServerOptions = {}) => {
  if (!appPromise) {
    appPromise = buildServer(options)
      .then(async (app) => {
        await app.ready();
        return app;
      })
      .catch((error) => {
        appPromise = null;
        throw error;
      });
  }
  return appPromise;
};

export const dispatchServerlessRequest = async (
  fastify: FastifyInstance,
  request: IncomingMessage,
  response: ServerResponse,
) =>
  new Promise<void>((resolve, reject) => {
    if (response.writableEnded || response.destroyed) {
      resolve();
      return;
    }

    const cleanup = () => {
      response.off('finish', finish);
      response.off('close', finish);
      response.off('error', fail);
    };
    const finish = () => {
      cleanup();
      resolve();
    };
    const fail = (error: Error) => {
      cleanup();
      reject(error);
    };

    response.once('finish', finish);
    response.once('close', finish);
    response.once('error', fail);
    fastify.server.emit('request', request, response);
  });

export const resetServerlessAppForTests = async () => {
  const existing = appPromise;
  appPromise = null;
  const app = await existing?.catch(() => null);
  await app?.close();
};
