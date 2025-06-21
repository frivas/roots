// Agent IDs for different activities
export const AGENT_IDS = {
  language: 'agent_01jxy264qbe49b8f3rk71wnzn7',
  chess: 'agent_01jxy432zjfq7rywx4wm7md5hh',
  math: 'agent_01jxy66c6tfsaadxfv6a1snq06',
  storytelling: 'agent_01jxy9664recb9nx14y9mj685n'
} as const;

// Static translations for widget UI
export const WIDGET_TRANSLATIONS = {
  en: {
    actionText: 'Click to talk',
    startCall: 'Start Call',
    endCall: 'End Call',
    expand: 'Expand',
    listening: 'Listening...',
    speaking: 'Speaking...'
  },
  es: {
    actionText: 'Haz clic para hablar',
    startCall: 'Iniciar Llamada',
    endCall: 'Finalizar Llamada',
    expand: 'Expandir',
    listening: 'Escuchando...',
    speaking: 'Hablando...'
  }
} as const;

// Widget configuration
export const WIDGET_CONFIG = {
  ELEMENT_NAME: 'elevenlabs-convai',
  SCRIPT_SRC: 'https://unpkg.com/@elevenlabs/convai-widget-embed'
} as const; 