export const shaForVercel = (deployment) =>
  deployment?.meta?.githubCommitSha ??
  deployment?.meta?.githubCommitRef ??
  deployment?.gitSource?.sha;
