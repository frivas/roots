import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockTranslateText = vi.fn(async (t: string) => `[es]${t}`);

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: 'en-US',
    translateText: mockTranslateText,
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
    setLanguage: vi.fn(),
    isTranslating: false,
  })),
}));

import useTranslatedString from '../hooks/useTranslatedString';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

/** Minimal shape that satisfies the hook's usage of useLingoTranslation */
type MockLingoCtx = {
  language: string;
  translateText: (t: string) => Promise<string>;
  preloadingComplete: boolean;
  isInitialized: boolean;
  isProviderMounted: boolean;
  setLanguage: (l: string) => void;
  isTranslating: boolean;
};

const enCtx = (): MockLingoCtx => ({
  language: 'en-US',
  translateText: mockTranslateText,
  preloadingComplete: true,
  isInitialized: true,
  isProviderMounted: true,
  setLanguage: vi.fn(),
  isTranslating: false,
});

const esCtx = (translateFn = mockTranslateText): MockLingoCtx => ({
  ...enCtx(),
  language: 'es-ES',
  translateText: translateFn,
});

describe('useTranslatedString', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLingoTranslation).mockReturnValue(enCtx() as any);
    mockTranslateText.mockClear();
  });

  it('returns input text unchanged for English', () => {
    const { result } = renderHook(() => useTranslatedString('Hello'));
    expect(result.current).toBe('Hello');
  });

  it('returns input unchanged for English regardless of text', () => {
    const { result } = renderHook(() => useTranslatedString('Test String'));
    expect(result.current).toBe('Test String');
  });

  it('calls translateText and updates result for Spanish (non-dict text)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLingoTranslation).mockReturnValue(esCtx() as any);
    // Use text that is NOT in the Spanish dictionary so it falls through to translateText
    const { result } = renderHook(() => useTranslatedString('xyzzy unknown phrase'));
    await waitFor(() => expect(result.current).toContain('xyzzy unknown phrase'));
  });

  it('uses local Spanish dictionary sync for known Spanish text', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLingoTranslation).mockReturnValue(esCtx() as any);
    // "Home" -> "Inicio" in the local dictionary; translateText should not be called
    const { result } = renderHook(() => useTranslatedString('Home'));
    await waitFor(() => expect(result.current).toBe('Inicio'));
    // translateText should NOT be called since dictionary hit is synchronous
    expect(mockTranslateText).not.toHaveBeenCalled();
  });

  it('returns the translated result from translateText when dictionary misses', async () => {
    const customFn = vi.fn(async () => 'translated-result');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLingoTranslation).mockReturnValue(esCtx(customFn) as any);
    const { result } = renderHook(() => useTranslatedString('another unknown phrase xyz'));
    await waitFor(() => expect(result.current).toBe('translated-result'));
  });
});
