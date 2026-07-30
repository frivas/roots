import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const commitSha = process.env.COMMIT_REF || process.env.GITHUB_SHA;
if (!/^[0-9a-f]{40}$/.test(commitSha ?? '')) {
  throw new Error('COMMIT_REF or GITHUB_SHA must be a lowercase 40-character SHA');
}

const outputDir = resolve('dist');
mkdirSync(outputDir, { recursive: true });
writeFileSync(
  resolve(outputDir, 'release.json'),
  `${JSON.stringify({ schemaVersion: 1, commitSha }, null, 2)}\n`,
);
