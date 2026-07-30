import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { AGENT_IDS, WIDGET_TRANSLATIONS, WIDGET_CONFIG } from './agentConfig';

describe('agentConfig', () => {
  it('exports AGENT_IDS with at least one agent id string starting with "agent_"', () => {
    const ids = Object.values(AGENT_IDS);
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach(id => {
      expect(id).toMatch(/^agent_/);
    });
  });

  it('keeps every voice-service agent in the shared registry', () => {
    expect(Object.keys(AGENT_IDS).sort()).toEqual([
      'chess',
      'language',
      'math',
      'parentWellness',
      'progressInterpretation',
      'storytelling',
    ]);
  });

  it('keeps voice-service pages free of copied agent ids and widget translations', () => {
    for (const page of [
      'ChessCoachingSession',
      'ExtraCurricularSession',
      'LanguageLessonSession',
      'MathTutoringSession',
      'ParentWellnessChat',
      'ProgressInterpretationChat',
      'StorytellingSession',
    ]) {
      const source = readFileSync(
        resolve(process.cwd(), `src/pages/services/${page}.tsx`),
        'utf8',
      );
      expect(source).not.toMatch(/agent_[0-9a-z]+/);
      expect(source).not.toMatch(/const\s+widgetTranslations\s*=/);
    }
  });

  it('en and es translation objects share the same keys', () => {
    const enKeys = Object.keys(WIDGET_TRANSLATIONS.en).sort();
    const esKeys = Object.keys(WIDGET_TRANSLATIONS.es).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('WIDGET_CONFIG.ELEMENT_NAME is a non-empty string', () => {
    expect(typeof WIDGET_CONFIG.ELEMENT_NAME).toBe('string');
    expect(WIDGET_CONFIG.ELEMENT_NAME.length).toBeGreaterThan(0);
  });

  it('WIDGET_CONFIG.SCRIPT_SRC matches a URL pattern', () => {
    expect(WIDGET_CONFIG.SCRIPT_SRC).toMatch(/^https?:\/\//);
  });
});
