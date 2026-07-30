import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('semantic color boundaries', () => {
  it.each([
    './components/layout/AuthLayout.tsx',
    './components/ClerkAuthWrapper.tsx',
    './components/layout/ModernSidebar.tsx',
    './pages/Dashboard.tsx',
    './pages/StudentProfile.tsx',
    './pages/services/StorytellingSession.tsx',
  ])('does not use palette-specific utility colors in %s', sourcePath => {
    expect(readSource(sourcePath)).not.toMatch(
      /(?:bg|text|border|ring)-(?:gray|red|blue|green|yellow|amber|purple)-/,
    );
  });
});
