import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('production build guards', () => {
  it('drops console and debugger from the production Vite minify step', () => {
    const src = readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf8');
    expect(src).toMatch(/drop_console:\s*true/);
    expect(src).toMatch(/drop_debugger:\s*true/);
  });

  it('registers ContributionDashboard only when import.meta.env.DEV is true', () => {
    const src = readFileSync(path.join(process.cwd(), 'src/App.tsx'), 'utf8');
    expect(src).toMatch(/import\.meta\.env\.DEV/);
    expect(src).toMatch(/ContributionDashboard/);
    expect(src).not.toMatch(
      /const ContributionDashboard = lazy\(\(\) => import\('\.\/pages\/ContributionDashboard'\)\);/,
    );
  });
});
