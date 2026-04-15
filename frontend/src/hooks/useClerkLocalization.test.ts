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
  let originalMutationObserver: typeof MutationObserver;

  beforeEach(() => {
    vi.useFakeTimers();
    mockLanguage = 'es-ES';
    originalMutationObserver = globalThis.MutationObserver;
    container = document.createElement('div');
    container.className = 'clerk-auth-madrid';
    container.innerHTML = `
      <div class="cl-headerTitle">Sign in</div>
      <div class="cl-headerSubtitle">to continue to roots</div>
      <div class="cl-footerActionText">No account?</div>
      <a href="/forgot-password">Forgot password?</a>
      <label for="password">Password</label>
      <p>to continue to roots</p>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.removeAttribute('data-clerk-loading');
    window.history.pushState({}, '', '/');
    globalThis.MutationObserver = originalMutationObserver;
    vi.useRealTimers();
  });

  it('does nothing when the Clerk container is missing', async () => {
    container.remove();
    const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

    renderHook(() => useClerkLocalization());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('translates stable Clerk content into Spanish', async () => {
    renderHook(() => useClerkLocalization());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(container.querySelector('.cl-headerTitle')?.textContent).toBe('Iniciar sesión');
    expect(container.querySelector('.cl-footerActionText')?.textContent).toBe('¿No tienes cuenta?');
    expect(container.querySelector('a[href*="forgot"]')?.textContent).toBe('¿Olvidaste tu contraseña?');
    expect(container.querySelector('label')?.textContent).toBe('Contraseña');
    expect(container.querySelector('.cl-headerSubtitle')?.textContent).toBe('to continue to Raíces');
    expect(container.querySelector('p')?.textContent).toBe('to continue to Raíces');
  });

  it('reverses Spanish Clerk content back to English when language is en-US', async () => {
    mockLanguage = 'en-US';
    container.innerHTML = `
      <div class="cl-headerTitle">Iniciar sesión</div>
      <div class="cl-footerActionText">¿No tienes cuenta?</div>
      <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
      <label for="password">Contraseña</label>
      <p>para ir a Raíces</p>
    `;

    renderHook(() => useClerkLocalization());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(container.querySelector('.cl-headerTitle')?.textContent).toBe('Sign in');
    expect(container.querySelector('.cl-footerActionText')?.textContent).toBe('No account?');
    expect(container.querySelector('a[href*="forgot"]')?.textContent).toBe('Forgot your password?');
    expect(container.querySelector('label')?.textContent).toBe('Password');
    expect(container.querySelector('p')?.textContent).toBe('to continue to Raíces');
  });

  it('rewrites the raw roots helper text in English mode', async () => {
    mockLanguage = 'en-US';
    container.innerHTML = '<span>to continue to roots</span>';

    renderHook(() => useClerkLocalization());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(container.querySelector('span')?.textContent).toBe('to continue to Raíces');
  });

  it('skips translation while auth is active or the flow is complex', async () => {
    window.history.pushState({}, '', '/verify/code');
    container.innerHTML = `
      <button disabled>Busy</button>
      <div class="cl-headerTitle">Sign in</div>
    `;

    renderHook(() => useClerkLocalization());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

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

  it('re-translates newly added Clerk content when the observer sees child list changes', async () => {
    let observerCallback: MutationCallback | undefined;
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();

    class MockMutationObserver {
      constructor(callback: MutationCallback) {
        observerCallback = callback;
      }

      observe = observeSpy;
      disconnect = disconnectSpy;
      takeRecords = vi.fn(() => []);
    }

    globalThis.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;

    renderHook(() => useClerkLocalization());
    expect(observeSpy).toHaveBeenCalled();

    const newNode = document.createElement('div');
    newNode.className = 'cl-footerActionText';
    newNode.textContent = 'No account?';
    container.appendChild(newNode);

    act(() => {
      observerCallback?.([
        {
          type: 'childList',
          addedNodes: [newNode] as unknown as NodeList,
          removedNodes: [] as unknown as NodeList,
          target: container,
          attributeName: null,
          attributeNamespace: null,
          nextSibling: null,
          oldValue: null,
          previousSibling: null,
        },
      ], {} as MutationObserver);
      vi.advanceTimersByTime(300);
    });

    expect(newNode.textContent).toBe('¿No tienes cuenta?');
    expect(disconnectSpy).not.toHaveBeenCalled();
  });

  it('re-runs translation on the interval when auth is stable', async () => {
    renderHook(() => useClerkLocalization());

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const title = container.querySelector('.cl-headerTitle');
    expect(title?.textContent).toBe('Iniciar sesión');

    if (title) {
      title.textContent = 'Sign in';
    }

    await act(async () => {
      vi.advanceTimersByTime(5300);
    });

    expect(container.querySelector('.cl-headerTitle')?.textContent).toBe('Iniciar sesión');
  });
});
