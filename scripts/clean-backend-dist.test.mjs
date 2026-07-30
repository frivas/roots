import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { cleanBackendDist } from './clean-backend-dist.mjs';

test('removes only the backend dist directory below the supplied repository root', () => {
  const root = mkdtempSync(join(tmpdir(), 'roots-clean-'));
  const dist = join(root, 'backend/dist');
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, 'stale.test.js'), 'stale');

  assert.equal(cleanBackendDist(root), dist);
  assert.equal(existsSync(dist), false);
  assert.equal(existsSync(root), true);
});
