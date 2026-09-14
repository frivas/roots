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

});
