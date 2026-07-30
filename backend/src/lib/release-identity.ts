const SHA_PATTERN = /^[0-9a-f]{40}$/i;

const isLocalEnvironment = (env: NodeJS.ProcessEnv) =>
  env.NODE_ENV === 'test' || env.NODE_ENV === 'development';

export const getReleaseSha = (env: NodeJS.ProcessEnv = process.env) => {
  const releaseSha =
    env.RELEASE_SHA ?? env.VERCEL_GIT_COMMIT_SHA ?? env.GITHUB_SHA;
  if (!releaseSha) {
    if (isLocalEnvironment(env)) {
      return 'local';
    }
    throw new Error('Missing immutable release SHA');
  }
  if (!SHA_PATTERN.test(releaseSha)) {
    throw new Error('Invalid immutable release SHA');
  }
  return releaseSha.toLowerCase();
};
