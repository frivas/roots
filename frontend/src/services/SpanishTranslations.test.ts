import { describe, it, expect } from 'vitest';
import { spanishTranslations, hasSpanishTranslation, getSpanishTranslation } from './SpanishTranslations';

describe('SpanishTranslations', () => {
  it('spanishTranslations has more than 100 entries', () => {
    expect(Object.keys(spanishTranslations).length).toBeGreaterThan(100);
  });

  it('hasSpanishTranslation returns true for a key that exists in the dictionary', () => {
    expect(hasSpanishTranslation('Home')).toBe(true);
  });

  it('hasSpanishTranslation returns false for an unknown key', () => {
    expect(hasSpanishTranslation('this_key_definitely_does_not_exist_xyz')).toBe(false);
  });

  it('getSpanishTranslation returns the mapped Spanish string for a known key', () => {
    const result = getSpanishTranslation('Home');
    expect(result).toBe('Inicio');
  });

  it('getSpanishTranslation returns the input string when key is not found', () => {
    const unknown = 'this_key_definitely_does_not_exist_xyz';
    const result = getSpanishTranslation(unknown);
    expect(result).toBe(unknown);
  });
});
