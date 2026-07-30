import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadElevenLabsWidget,
  resetElevenLabsWidgetLoaderForTests,
  useElevenLabsWidget,
} from './useElevenLabsWidget';

describe('ElevenLabs widget lifecycle', () => {
  beforeEach(() => {
    document.head.querySelectorAll('script[data-elevenlabs-widget]').forEach(script => script.remove());
    document.body.replaceChildren();
    resetElevenLabsWidgetLoaderForTests();
    vi.spyOn(window.customElements, 'get').mockReturnValue(undefined);
    vi.spyOn(window.customElements, 'whenDefined').mockResolvedValue(undefined);
  });

  it('deduplicates concurrent script requests', async () => {
    const first = loadElevenLabsWidget();
    const second = loadElevenLabsWidget();
    const script = document.head.querySelector<HTMLScriptElement>('script[data-elevenlabs-widget]');

    expect(script).not.toBeNull();
    expect(document.head.querySelectorAll('script[data-elevenlabs-widget]')).toHaveLength(1);
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
});
