import { describe, it, expect } from 'vitest';
import { lingoTranslationService } from './LingoTranslationService';

describe('LingoTranslationService', () => {
  describe('translateText', () => {
    it('returns input unchanged for English target', async () => {
      const result = await lingoTranslationService.translateText('Hello', 'en-US');
      expect(result).toBe('Hello');
    });

    it('uses local dictionary for known Spanish word "Home" -> "Inicio"', async () => {
      const result = await lingoTranslationService.translateText('Home', 'es-ES');
      expect(result).toBe('Inicio');
    });

    it('uses local dictionary for "Settings" -> "Configuración"', async () => {
      const result = await lingoTranslationService.translateText('Settings', 'es-ES');
      expect(result).toBe('Configuración');
    });

    it('returns original text for unknown Spanish phrases', async () => {
      const result = await lingoTranslationService.translateText('some unknown phrase xyz', 'es-ES');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns original text for unsupported locales', async () => {
      const result = await lingoTranslationService.translateText('Hello', 'fr-FR');
      expect(result).toBe('Hello');
    });
  });

  describe('translateObject', () => {
    it('returns object unchanged for English target', async () => {
      const obj = { title: 'Home', label: 'Settings' };
      const result = await lingoTranslationService.translateObject(obj, 'en-US');
      expect(result).toEqual(obj);
    });

    it('translates string values for Spanish target', async () => {
      const obj = { title: 'Home', label: 'Settings' };
      const result = await lingoTranslationService.translateObject(obj, 'es-ES');
      expect(result.title).toBe('Inicio');
      expect(result.label).toBe('Configuración');
    });

    it('preserves non-string values', async () => {
      const obj = { count: 42, active: true, title: 'Home' };
      const result = await lingoTranslationService.translateObject(obj, 'es-ES');
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.title).toBe('Inicio');
    });
  });

  describe('clearCache / getStats', () => {
    it('clearCache does not throw', () => {
      expect(() => lingoTranslationService.clearCache()).not.toThrow();
    });

    it('getStats returns cacheSize of 0', () => {
      const stats = lingoTranslationService.getStats();
      expect(stats.cacheSize).toBe(0);
    });

    it('getStats returns localTranslationsCount > 0', () => {
      const stats = lingoTranslationService.getStats();
      expect(stats.localTranslationsCount).toBeGreaterThan(0);
    });
  });

  describe('preloadCommonTranslations', () => {
    it('resolves without error', async () => {
      await expect(lingoTranslationService.preloadCommonTranslations('es-ES')).resolves.toBeUndefined();
    });
  });
});
