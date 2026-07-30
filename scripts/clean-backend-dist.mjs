#!/usr/bin/env node

import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export function cleanBackendDist(root = repositoryRoot) {
  const expected = resolve(root, 'backend/dist');
  if (expected === resolve(root) || !expected.endsWith('/backend/dist')) {
    throw new Error(`Refusing to clean unexpected path: ${expected}`);
  }
  rmSync(expected, { recursive: true, force: true });
  return expected;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Cleaned ${cleanBackendDist()}`);
}
