export type RuntimeMode = 'connected' | 'demo';

export const getRuntimeMode = (
  env: NodeJS.ProcessEnv = process.env,
): RuntimeMode => {
  const mode = env.ROOTS_BACKEND_MODE ?? 'demo';
  if (mode !== 'demo' && mode !== 'connected') {
    throw new Error('ROOTS_BACKEND_MODE must be demo or connected');
  }
  return mode;
};
