import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  enforceBundleBudget,
  measureBundle,
  readBundleBudgets,
} from './check-bundle-budget.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'roots-bundle-'));
  mkdirSync(join(root, 'assets'));
  writeFileSync(
    join(root, 'index.html'),
    '<script type="module" src="/assets/app.js"></script>'
      + '<link rel="stylesheet" href="/assets/app.css">',
  );
  writeFileSync(join(root, 'assets/app.js'), 'export const value = "small";');
  writeFileSync(join(root, 'assets/app.css'), 'body { color: black; }');
  return root;
}

test('measures only entry-referenced assets as initial payload', () => {
  const root = fixture();
  writeFileSync(join(root, 'assets/lazy.js'), 'export const lazy = true;');
  const result = measureBundle(root);
  assert.deepEqual(result.initialAssets, ['/assets/app.js', '/assets/app.css']);
  assert.ok(result.totalGzipBytes > result.initialGzipBytes);
});

test('fails closed when a bundle exceeds its budget', () => {
  assert.throws(
    () => enforceBundleBudget(
      { initialGzipBytes: 11, totalGzipBytes: 20 },
      { initialGzipBytesMax: 10, totalGzipBytesMax: 20 },
    ),
    /Bundle budget failed/,
  );
});

test('validates checked-in bundle budgets', () => {
  const budgets = readBundleBudgets();
  assert.ok(budgets.initialGzipBytesMax > 0);
  assert.ok(budgets.totalGzipBytesMax >= budgets.initialGzipBytesMax);
});
