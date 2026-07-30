import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicImage = (name: string) =>
  resolve(process.cwd(), `public/images/${name}`);
const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf8');

describe('profile image delivery', () => {
  it.each(['lucia-profile', 'sofia-profile'])(
    'ships compact AVIF and WebP variants for %s',
    basename => {
      for (const extension of ['avif', 'webp']) {
        const asset = publicImage(`${basename}.${extension}`);
        expect(existsSync(asset)).toBe(true);
        expect(statSync(asset).size).toBeLessThan(100_000);
      }
    },
  );

  it.each([
    ['./pages/TutorInfo.tsx', 'lucia-profile'],
    ['./pages/StudentProfile.tsx', 'sofia-profile'],
  ])('uses responsive lazy picture markup in %s', (sourcePath, basename) => {
    const source = readSource(sourcePath);

    expect(source).toContain('<picture>');
    expect(source).toContain(`/images/${basename}.avif`);
    expect(source).toContain(`/images/${basename}.webp`);
    expect(source).toContain('loading="lazy"');
    expect(source).toContain('decoding="async"');
    expect(source).toMatch(/\bwidth=\{?\d+/);
    expect(source).toMatch(/\bheight=\{?\d+/);
  });
});
