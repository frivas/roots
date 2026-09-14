import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('frontend accessibility boundaries', () => {
  it.each([
    './pages/PasswordChange.tsx',
    './pages/PersonalData.tsx',
    './pages/PersonalCalendar.tsx',
  ])('uses in-page feedback instead of native alerts in %s', sourcePath => {
    expect(readSource(sourcePath)).not.toMatch(/\balert\s*\(/);
  });

  it('honors reduced-motion preferences for React motion and CSS animation', () => {
    expect(readSource('./main.tsx')).toContain('<MotionConfig reducedMotion="user">');
    expect(readSource('./index.css')).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps Tailwind font weight utilities from changing the typeface', () => {
    expect(readSource('./index.css')).not.toMatch(/\.font-bold\s*\{/);
    expect(readSource('./index.css')).not.toContain('font-family: Arial');
  });

  it('provides branded sharing and browser metadata', () => {
    const html = readSource('../index.html');

    expect(html).toContain('name="theme-color"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('name="twitter:card"');
  });

  it('keeps the message toolbar and folder tabs usable on narrow screens', () => {
    const messages = readSource('./pages/Messages.tsx');

    expect(messages).toContain('flex-col gap-3 sm:flex-row');
    expect(messages).toContain('overflow-x-auto');
  });

  it.each([
    './pages/Dashboard.tsx',
    './pages/Messages.tsx',
    './pages/Services.tsx',
    './pages/Notifications.tsx',
  ])('provides one semantic page heading in %s', sourcePath => {
    const page = readSource(sourcePath);

    expect(page).toMatch(/(?:element="h1"|<motion\.h1|<h1)/);
  });

  it.each([
    './pages/Absences.tsx',
    './pages/AcademicHistory.tsx',
    './pages/Activities.tsx',
    './pages/Bulletin.tsx',
    './pages/CurrentYearGrades.tsx',
    './pages/Documents.tsx',
    './pages/StudentProfile.tsx',
  ])('reuses shared page motion in %s', sourcePath => {
    const page = readSource(sourcePath);

    expect(page).toContain("from '../lib/motion'");
    expect(page).not.toContain('const containerVariants');
    expect(page).not.toContain('const itemVariants');
  });
});
