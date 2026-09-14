import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { checkFile } from './check-localization.js';

test('className does not hide user-facing JSX text or browser dialogs', () => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-localization-'));
  const fixture = join(directory, 'Fixture.tsx');
  writeFileSync(fixture, [
    '<h1 className="text-xl">Untranslated heading</h1>',
    'alert("Changes saved successfully")',
  ].join('\n'));

  try {
    const issues = checkFile(fixture);
    assert.deepEqual(issues.map(({ line }) => line), [1, 1, 2]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('translated JSX remains accepted when it also has className', () => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-localization-'));
  const fixture = join(directory, 'Fixture.tsx');
  writeFileSync(
    fixture,
    '<h1 className="text-xl"><TranslatedText>Translated heading</TranslatedText></h1>\n',
  );

  try {
    assert.deepEqual(checkFile(fixture), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('AgentSession title props are accepted because the component translates them', () => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-localization-'));
  const fixture = join(directory, 'Fixture.tsx');
  writeFileSync(fixture, [
    '<AgentSession',
    '  agentId="agent-test"',
    '  title="Math Tutoring"',
    '  backLabel="Back to Learning"',
    '/>',
    '<Widget title="Untranslated tooltip">Visible content</Widget>',
  ].join('\n'));

  try {
    const issues = checkFile(fixture);
    assert.deepEqual(issues.map(({ match }) => match), [
      '>Visible content<',
      'title="Untranslated tooltip"',
    ]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('dynamic JSX values are not treated as source-language literals', () => {
  const directory = mkdtempSync(join(tmpdir(), 'roots-localization-'));
  const fixture = join(directory, 'Fixture.tsx');
  writeFileSync(fixture, '<h2>{selectedMessage.subject}</h2>\n');

  try {
    assert.deepEqual(checkFile(fixture), []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
