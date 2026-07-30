import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('initial frontend payload boundaries', () => {
  it('lazy-loads TutorInfo with the other page modules', () => {
    const appSource = readSource('./App.tsx');

    expect(appSource).not.toMatch(/import TutorInfo from ['"]\.\/pages\/TutorInfo['"]/);
    expect(appSource).toContain("const TutorInfo = lazy(() => import('./pages/TutorInfo'))");
  });

  it.each([
    './contexts/LingoTranslationContext.tsx',
    './components/TranslatedText.tsx',
    './hooks/useTranslatedString.ts',
  ])('does not eagerly import the Spanish dictionary from %s', sourcePath => {
    expect(readSource(sourcePath)).not.toMatch(
      /import\s+\{?\s*getSpanishTranslation.*SpanishTranslations/,
    );
  });

  it.each([
    './contexts/LingoTranslationContext.tsx',
    './components/RouteWrapper.tsx',
  ])('does not gate readiness with a fixed timeout in %s', sourcePath => {
    expect(readSource(sourcePath)).not.toContain('setTimeout(');
  });

  it('honors the user reduced-motion preference in React and CSS', () => {
    expect(readSource('./App.tsx')).toContain('<MotionConfig reducedMotion="user">');
    expect(readSource('./index.css')).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
