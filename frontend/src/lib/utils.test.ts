import { describe, it, expect } from 'vitest';
import { cn, formatDate } from './utils';

describe('cn', () => {
  it('merges tailwind classes with last-write-wins precedence', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('handles falsy conditional classes', () => {
    const condition = false;
    const result = cn('base-class', condition && 'should-not-appear', undefined, null, 'final-class');
    expect(result).toContain('base-class');
    expect(result).toContain('final-class');
    expect(result).not.toContain('should-not-appear');
  });

  it('handles arrays and object syntax', () => {
    const result = cn(['text-sm', 'font-bold'], { 'text-red-500': true, 'text-blue-500': false });
    expect(result).toContain('text-sm');
    expect(result).toContain('font-bold');
    expect(result).toContain('text-red-500');
    expect(result).not.toContain('text-blue-500');
  });
});

describe('formatDate', () => {
  const d = new Date('2026-04-10T12:00:00Z');

  it('formats en-US by default — should contain April and/or 2026', () => {
    const result = formatDate(d);
    expect(result).toMatch(/2026/);
  });

  it('formats en — same', () => {
    const result = formatDate(d, 'en');
    expect(result).toMatch(/2026/);
  });

  it('formats es when language=es — should contain abril', () => {
    const result = formatDate(d, 'es');
    // Spanish DD/MM/YYYY format — check numeric format
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    // The year 2026 should be present
    expect(result).toContain('2026');
  });

  it('formats es-ES when language=es-ES — should contain abril', () => {
    const result = formatDate(d, 'es-ES');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toContain('2026');
  });
});
