import { useCallback, useEffect, useRef, useState } from 'react';
import { WIDGET_CONFIG } from '../config/agentConfig';

const SCRIPT_SELECTOR = 'script[data-elevenlabs-widget]';
export const WIDGET_LOAD_TIMEOUT_MS = 15_000;

interface WidgetLoader {
  promise: Promise<void>;
  cancel: () => void;
}

let widgetLoader: WidgetLoader | null = null;

export const loadElevenLabsWidget = (): Promise<void> => {
  if (window.customElements.get(WIDGET_CONFIG.ELEMENT_NAME)) {
    return Promise.resolve();
  }
  if (widgetLoader) return widgetLoader.promise;

  let cancel: () => void = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    const existingScript = document.head.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
    const script = existingScript ?? document.createElement('script');
    let settled = false;

    const cleanup = () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
    const complete = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };

    const handleLoad = () => {
      void window.customElements.whenDefined(WIDGET_CONFIG.ELEMENT_NAME).then(
        () => complete(resolve),
        () => complete(() => reject(new Error('Unable to load the voice assistant.'))),
      );
    };
    const handleError = () => complete(() => {
      if (!existingScript) script.remove();
      reject(new Error('Unable to load the voice assistant.'));
    });

    cancel = () => complete(() => {
      if (!window.customElements.get(WIDGET_CONFIG.ELEMENT_NAME)) script.remove();
      reject(new Error('Voice assistant loading was cancelled.'));
    });

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (existingScript) {
      void window.customElements.whenDefined(WIDGET_CONFIG.ELEMENT_NAME).then(
        () => complete(resolve),
        () => complete(() => reject(new Error('Unable to load the voice assistant.'))),
      );
    } else {
      script.src = WIDGET_CONFIG.SCRIPT_SRC;
      script.integrity = WIDGET_CONFIG.SCRIPT_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.async = true;
      script.type = 'text/javascript';
      script.dataset.elevenlabsWidget = 'true';
      document.head.appendChild(script);
    }
  }).catch(error => {
    widgetLoader = null;
    throw error;
  });

  widgetLoader = { promise, cancel };
  return promise;
};

interface UseElevenLabsWidgetOptions {
  agentId: string;
  language: string;
  attributes?: Record<string, string>;
  onWidgetReady?: (widget: HTMLElement) => void | (() => void);
}

export const useElevenLabsWidget = ({
  agentId,
  language,
  attributes = {},
  onWidgetReady,
}: UseElevenLabsWidgetOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const attributesKey = JSON.stringify(attributes);

  useEffect(() => {
    let cancelled = false;
    let widget: HTMLElement | null = null;
    let cleanupWidget: void | (() => void);
    let settled = false;
    setStatus('loading');
    setError(null);

    const timeoutId = window.setTimeout(() => {
      if (cancelled || settled) return;
      settled = true;
      widgetLoader?.cancel();
      setError('An error occurred');
      setStatus('error');
    }, WIDGET_LOAD_TIMEOUT_MS);

    void loadElevenLabsWidget()
      .then(() => {
        if (cancelled || settled || !containerRef.current) return;
        settled = true;
        window.clearTimeout(timeoutId);

        const elevenLabs = window.ElevenLabs;
        if (typeof elevenLabs?.init === 'function') {
          elevenLabs.init({ language, defaultLanguage: language });
        }

        widget = document.createElement(WIDGET_CONFIG.ELEMENT_NAME);
        const widgetAttributes = {
          'agent-id': agentId,
          language,
          'default-language': language,
          ...JSON.parse(attributesKey) as Record<string, string>,
        };
        Object.entries(widgetAttributes).forEach(([key, value]) => {
          widget?.setAttribute(key, value);
        });

        containerRef.current.replaceChildren(widget);
        cleanupWidget = onWidgetReady?.(widget);
        setError(null);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled && !settled) {
          settled = true;
          window.clearTimeout(timeoutId);
          setError('An error occurred');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (!settled) widgetLoader?.cancel();
      cleanupWidget?.();
      widget?.remove();
    };
  }, [agentId, language, attributesKey, onWidgetReady, attempt]);

  const retry = useCallback(() => setAttempt(current => current + 1), []);

  return { containerRef, error, status, retry };
};

export const resetElevenLabsWidgetLoaderForTests = () => {
  widgetLoader = null;
};

declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: Record<string, unknown>) => void;
    };
  }
}
