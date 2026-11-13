import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

// Only the files the validator reads are copied, so a test can change one input.
const copied = [
  '.github',
  '.gitignore',
  '.husky',
  '.nvmrc',
  'backend/package.json',
  'backend/tsconfig.build.json',
  'backend/vercel.json',
  'backend/vitest.config.ts',
  'frontend/package.json',
  'frontend/playwright.config.ts',
  'frontend/vite.config.ts',
  'frontend/vitest.config.ts',
  'netlify.toml',
  'package.json',
  'scripts',
];
const keep = (source) => {
  const path = relative(repositoryRoot, source).split(sep).join('/');
  return (
    path === '' ||
    path === 'backend' ||
    path === 'frontend' ||
    copied.some((entry) => path === entry || path.startsWith(`${entry}/`))
  );
};

const validate = (mutate = () => {}) => {
  const copy = mkdtempSync(join(tmpdir(), 'roots-validate-'));
  try {
    cpSync(repositoryRoot, copy, { recursive: true, filter: keep });
    symlinkSync(join(repositoryRoot, 'node_modules'), join(copy, 'node_modules'));
    const edit = (path, change) => {
      const file = join(copy, path);
      writeFileSync(file, change(readFileSync(file, 'utf8')));
    };
    mutate(edit);
    return spawnSync(process.execPath, [join(copy, 'scripts/validate-ci-config.mjs')], {
      cwd: copy,
      encoding: 'utf8',
    });
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
};

const declareLine24 = (edit) => {
  edit('.nvmrc', () => '24\n');
  for (const path of ['package.json', 'frontend/package.json', 'backend/package.json']) {
    edit(path, (text) => text.replace(/"node": "[^"]*"/, '"node": "24.x"'));
  }
  edit('netlify.toml', (text) => text.replace(/\n\[build\.environment\]\n\s*NODE_VERSION = "[^"]*"\n/, '\n'));
};

test('CI, runtime, deployment, and canonical tooling contracts are valid', () => {
  const result = spawnSync(process.execPath, ['scripts/validate-ci-config.mjs'], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated \d+ workflow files/);
});

test('the Node 24 line is accepted: .nvmrc 24, engines 24.x, no NODE_VERSION in netlify.toml', () => {
  const result = validate(declareLine24);
  assert.equal(result.status, 0, result.stderr);
});

test('.nvmrc must hold the bare major 24', () => {
  for (const value of ['22.22.2\n', '24.22.2\n', '22\n', 'lts/*\n']) {
    const result = validate((edit) => {
      declareLine24(edit);
      edit('.nvmrc', () => value);
    });
    assert.notEqual(result.status, 0, `.nvmrc ${JSON.stringify(value)} was accepted`);
    assert.match(result.stderr, /\.nvmrc must hold the bare major 24/);
  }
});

test('every package must bound engines.node to 24.x', () => {
  for (const [name, path] of [
    ['root', 'package.json'],
    ['frontend', 'frontend/package.json'],
    ['backend', 'backend/package.json'],
  ]) {
    for (const range of ['>=22.22.2 <23', '>=24', '24.x || 22.x']) {
      const result = validate((edit) => {
        declareLine24(edit);
        edit(path, (text) => text.replace(/"node": "[^"]*"/, `"node": "${range}"`));
      });
      assert.notEqual(result.status, 0, `${name} engines ${range} was accepted`);
      assert.match(result.stderr, new RegExp(`${name} package must enforce the Node 24 runtime contract`));
    }
  }
});

test('netlify.toml must leave the Node version to .nvmrc', () => {
  for (const value of ['22.22.2', '24']) {
    const result = validate((edit) => {
      declareLine24(edit);
      edit('netlify.toml', (text) =>
        text.replace('[build]\n', `[build.environment]\n  NODE_VERSION = "${value}"\n\n[build]\n`),
      );
    });
    assert.notEqual(result.status, 0, `NODE_VERSION ${value} was accepted`);
    assert.match(result.stderr, /netlify\.toml must not set NODE_VERSION/);
  }
});
