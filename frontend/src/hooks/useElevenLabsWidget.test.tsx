import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadElevenLabsWidget,
  resetElevenLabsWidgetLoaderForTests,
  useElevenLabsWidget,
  WIDGET_LOAD_TIMEOUT_MS,
} from './useElevenLabsWidget';
import { WIDGET_CONFIG } from '../config/agentConfig';

describe('ElevenLabs widget lifecycle', () => {
  beforeEach(() => {
    vi.useRealTimers();
    document.head.querySelectorAll('script[data-elevenlabs-widget]').forEach(script => script.remove());
    document.body.replaceChildren();
    resetElevenLabsWidgetLoaderForTests();
    vi.spyOn(window.customElements, 'get').mockImplementation(
      () => undefined as unknown as CustomElementConstructor,
    );
    vi.spyOn(window.customElements, 'whenDefined').mockResolvedValue(
      class extends HTMLElement {},
    );
  });

  it('deduplicates concurrent script requests', async () => {
    const first = loadElevenLabsWidget();
    const second = loadElevenLabsWidget();
    const script = document.head.querySelector<HTMLScriptElement>('script[data-elevenlabs-widget]');

    expect(script).not.toBeNull();
    expect(document.head.querySelectorAll('script[data-elevenlabs-widget]')).toHaveLength(1);
    expect(script?.src).toBe(WIDGET_CONFIG.SCRIPT_SRC);
    expect(script?.integrity).toBe(WIDGET_CONFIG.SCRIPT_INTEGRITY);
    expect(script?.crossOrigin).toBe('anonymous');
    act(() => script?.dispatchEvent(new Event('load')));

    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBeUndefined();
  });

  it('removes only its scoped widget when unmounted', async () => {
    vi.mocked(window.customElements.get).mockReturnValue(
      class extends HTMLElement {},
    );
    const { result, unmount } = renderHook(() =>
      useElevenLabsWidget({ agentId: 'agent-test', language: 'en-US' }),
    );
    const container = document.createElement('div');
    const unrelated = document.createElement('elevenlabs-convai');
    document.body.append(container, unrelated);

    act(() => {
      result.current.containerRef.current = container;
    });
    await waitFor(() =>
      expect(container.querySelector('elevenlabs-convai')).not.toBeNull(),
    );

    unmount();

    expect(container.querySelector('elevenlabs-convai')).toBeNull();
    expect(unrelated).toBeInTheDocument();
  });

  it('times out a stalled load, removes the failed script, and can retry', async () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() =>
      useElevenLabsWidget({ agentId: 'agent-test', language: 'en-US' }),
    );

    expect(result.current.status).toBe('loading');
    expect(document.head.querySelectorAll('script[data-elevenlabs-widget]')).toHaveLength(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(WIDGET_LOAD_TIMEOUT_MS);
    });

    expect(result.current.status).toBe('error');
    expect(document.head.querySelector('script[data-elevenlabs-widget]')).toBeNull();

    act(() => result.current.retry());

    expect(result.current.status).toBe('loading');
    expect(document.head.querySelectorAll('script[data-elevenlabs-widget]')).toHaveLength(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears its timeout and pending script when unmounted during loading', () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() =>
      useElevenLabsWidget({ agentId: 'agent-test', language: 'en-US' }),
    );

    expect(vi.getTimerCount()).toBe(1);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(document.head.querySelector('script[data-elevenlabs-widget]')).toBeNull();
  });
});
