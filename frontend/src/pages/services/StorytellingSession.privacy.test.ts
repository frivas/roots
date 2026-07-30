import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/pages/services/StorytellingSession.tsx'),
  'utf8',
);

describe('StorytellingSession privacy boundary', () => {
  it('does not log story text, prompts, responses, tokens, or generated URLs', () => {
    expect(source).not.toMatch(/console\.(?:log|debug|info|warn|error)\s*\(/);
    expect(source).not.toContain('actualImageUrl');
    expect(source).not.toContain('Debug:</strong>');
  });
});
