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
