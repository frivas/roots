import {
  buildServer,
  type BuildServerOptions,
} from './index.js';

let app: Awaited<ReturnType<typeof buildServer>> | null = null;

export const getServerlessApp = async (options: BuildServerOptions = {}) => {
  if (!app) {
    app = await buildServer(options);
    await app.ready();
  }
  return app;
};

export const resetServerlessAppForTests = async () => {
  const existing = app;
  app = null;
  await existing?.close();
};
