import { readFileSync } from 'node:fs';

const lockfile = JSON.parse(
  readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'),
);
const denied = new Set([
  'GPL-3.0',
  'GPL-3.0-ONLY',
  'GPL-3.0-OR-LATER',
  'AGPL-3.0',
  'AGPL-3.0-ONLY',
  'AGPL-3.0-OR-LATER',
]);
const violations = [];
const missing = [];
let checked = 0;

for (const [path, metadata] of Object.entries(lockfile.packages ?? {})) {
  if (!path.startsWith('node_modules/') || metadata.dev || metadata.link) continue;
  checked += 1;
  if (!metadata.license) {
    missing.push(path);
    continue;
  }
  const tokens = metadata.license.toUpperCase().match(/[A-Z0-9.-]+/g) ?? [];
  const prohibited = tokens.filter((token) => denied.has(token));
  if (prohibited.length > 0) {
    violations.push(`${path}: ${metadata.license}`);
  }
}

if (missing.length > 0) {
  throw new Error(`production dependencies missing license metadata:\n${missing.join('\n')}`);
}
if (violations.length > 0) {
  throw new Error(`prohibited production licenses found:\n${violations.join('\n')}`);
}
console.log(`Checked ${checked} production dependency licenses.`);
