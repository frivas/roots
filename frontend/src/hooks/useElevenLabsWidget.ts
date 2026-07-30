import { useEffect, useRef, useState } from 'react';

const WIDGET_ELEMENT_NAME = 'elevenlabs-convai';
const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
const SCRIPT_SELECTOR = 'script[data-elevenlabs-widget]';

let widgetLoaderPromise: Promise<void> | null = null;

export const loadElevenLabsWidget = (): Promise<void> => {
  if (window.customElements.get(WIDGET_ELEMENT_NAME)) {
    return Promise.resolve();
  }
  if (widgetLoaderPromise) return widgetLoaderPromise;

  widgetLoaderPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.head.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR);
    const script = existingScript ?? document.createElement('script');

    const handleLoad = () => {
      void window.customElements.whenDefined(WIDGET_ELEMENT_NAME).then(() => resolve(), reject);
    };
    const handleError = () => reject(new Error('Unable to load the voice assistant.'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (existingScript) {
      void window.customElements.whenDefined(WIDGET_ELEMENT_NAME).then(() => resolve(), reject);
    } else {
      script.src = SCRIPT_SRC;
      script.async = true;
      script.type = 'text/javascript';
      script.dataset.elevenlabsWidget = 'true';
      document.head.appendChild(script);
    }
  }).catch(error => {
    widgetLoaderPromise = null;
    throw error;
  });

  return widgetLoaderPromise;
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
  const attributesKey = JSON.stringify(attributes);

  useEffect(() => {
    let cancelled = false;
    let widget: HTMLElement | null = null;
    let cleanupWidget: void | (() => void);

    void loadElevenLabsWidget()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const elevenLabs = window.ElevenLabs;
        if (typeof elevenLabs?.init === 'function') {
          elevenLabs.init({ language, defaultLanguage: language });
        }

        widget = document.createElement(WIDGET_ELEMENT_NAME);
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
      })
      .catch(() => {
        if (!cancelled) setError('The voice assistant is unavailable. Please try again.');
      });

    return () => {
      cancelled = true;
      cleanupWidget?.();
      widget?.remove();
    };
  }, [agentId, language, attributesKey, onWidgetReady]);

  return { containerRef, error };
};

export const resetElevenLabsWidgetLoaderForTests = () => {
  widgetLoaderPromise = null;
};

declare global {
  interface Window {
    ElevenLabs?: {
      init?: (config: Record<string, unknown>) => void;
    };
  }
}
