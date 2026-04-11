import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: 'es-ES',
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: vi.fn(async (t: string) => `[es]${t}`),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
}));

import useClerkLocalization from '../hooks/useClerkLocalization';

describe('useClerkLocalization', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    container.className = 'clerk-auth-madrid';
    container.innerHTML = `
      <div class="cl-headerTitle">Sign in to roots</div>
      <div class="cl-headerSubtitle">to continue to roots</div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  it('replaces Clerk text content when language is es-ES without throwing', async () => {
    // Should run without errors; the hook mutates DOM
    expect(() => renderHook(() => useClerkLocalization())).not.toThrow();
    await act(async () => { vi.advanceTimersByTime(300); });
  });

  it('cleans up observer and interval on unmount', () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useClerkLocalization());
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('polls via setInterval', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    renderHook(() => useClerkLocalization());
    expect(setIntervalSpy).toHaveBeenCalled();
  });

  it('observes the clerk container via MutationObserver', () => {
    const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
    renderHook(() => useClerkLocalization());
    expect(observeSpy).toHaveBeenCalled();
  });
});
