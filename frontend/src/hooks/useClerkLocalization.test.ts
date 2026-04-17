import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let mockLanguage = 'es-ES';

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: mockLanguage,
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
    mockLanguage = 'es-ES';
    vi.useFakeTimers();
    container = document.createElement('div');
    container.className = 'clerk-auth-madrid';
    container.innerHTML = `
      <div class="cl-card">
        <div class="cl-headerTitle">Sign in</div>
        <div class="cl-headerSubtitle">to continue to roots</div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  it('replaces Clerk text content when language is es-ES without throwing', async () => {
    expect(() => renderHook(() => useClerkLocalization())).not.toThrow();
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(container.querySelector('.cl-headerTitle')?.textContent).toBe('Iniciar sesión');
    expect(container.querySelector('.cl-headerSubtitle')?.textContent).toBe('to continue to Raíces');
  });

  it('reverses translated text when the language is en-US', async () => {
    mockLanguage = 'en-US';
    container.innerHTML = `
      <div class="cl-card">
        <div class="cl-headerTitle">Iniciar sesión</div>
        <div class="cl-headerSubtitle">para ir a Raíces</div>
      </div>
    `;

    renderHook(() => useClerkLocalization());
    await act(async () => { vi.advanceTimersByTime(300); });

    expect(container.querySelector('.cl-headerTitle')?.textContent).toBe('Sign in');
    expect(container.querySelector('.cl-headerSubtitle')?.textContent).toBe('to continue to Raíces');
  });

  it('translates forgot password links when auth is stable', async () => {
    container.innerHTML = `
      <div class="cl-card">
        <a href="/forgot-password">Forgot password?</a>
      </div>
    `;

    renderHook(() => useClerkLocalization());
    await act(async () => { vi.advanceTimersByTime(300); });

    expect(container.querySelector('a')?.textContent).toBe('¿Olvidaste tu contraseña?');
  });

  it('skips translation while an auth action is in progress', async () => {
    container.innerHTML = `
      <div class="cl-card">
        <button disabled>Signing in</button>
        <div class="cl-headerTitle">Sign in</div>
      </div>
    `;

    renderHook(() => useClerkLocalization());
    await act(async () => { vi.advanceTimersByTime(300); });

    expect(container.querySelector('.cl-headerTitle')?.textContent).toBe('Sign in');
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

  it('re-translates newly added Clerk content after a mutation', async () => {
    renderHook(() => useClerkLocalization());
    await act(async () => { vi.advanceTimersByTime(300); });

    const newNode = document.createElement('div');
    newNode.className = 'cl-footerActionText';
    newNode.textContent = 'No account?';
    container.appendChild(newNode);

    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(300);
    });

    expect(newNode.textContent).toBe('¿No tienes cuenta?');
  });

  it('retries translation during the periodic interval when auth is idle', async () => {
    renderHook(() => useClerkLocalization());
    await act(async () => { vi.advanceTimersByTime(300); });

    const title = container.querySelector('.cl-headerTitle');
    if (!title) {
      throw new Error('Expected header title');
    }

    title.textContent = 'Sign in';

    await act(async () => {
      vi.advanceTimersByTime(5000);
      vi.advanceTimersByTime(300);
    });

    expect(title.textContent).toBe('Iniciar sesión');
  });
});
