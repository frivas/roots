import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const {
  mockTranslateText,
  mockGetSpanishTranslation,
  getMockLanguage,
  setMockLanguage,
} = vi.hoisted(() => {
  let language = 'en-US';
  return {
    mockTranslateText: vi.fn(async (text: string) => text),
    mockGetSpanishTranslation: vi.fn((text: string) => text),
    getMockLanguage: () => language,
    setMockLanguage: (nextLanguage: string) => {
      language = nextLanguage;
    },
  };
});

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: getMockLanguage(),
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: mockTranslateText,
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../services/SpanishTranslations', () => ({
  getSpanishTranslation: mockGetSpanishTranslation,
}));

import TranslatedText from './TranslatedText';

describe('TranslatedText', () => {
  beforeEach(() => {
    setMockLanguage('en-US');
    mockTranslateText.mockReset();
    mockTranslateText.mockImplementation(async (text: string) => text);
    mockGetSpanishTranslation.mockReset();
    mockGetSpanishTranslation.mockImplementation((text: string) => text);
  });

  it('renders children as text', () => {
    render(<TranslatedText>Hello World</TranslatedText>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders with element=span by default', () => {
    const { container } = render(<TranslatedText>Default span</TranslatedText>);
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span?.textContent).toBe('Default span');
  });

  it('renders with element=p as paragraph', () => {
    const { container } = render(
      <TranslatedText element="p">Paragraph text</TranslatedText>
    );
    const p = container.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p?.textContent).toBe('Paragraph text');
  });

  it('renders with element=h1 as heading', () => {
    const { container } = render(
      <TranslatedText element="h1">Heading text</TranslatedText>
    );
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe('Heading text');
  });

  it('applies className prop', () => {
    const { container } = render(
      <TranslatedText className="my-class">Text</TranslatedText>
    );
    expect(container.querySelector('.my-class')).toBeInTheDocument();
  });

  it('renders with element=div', () => {
    const { container } = render(
      <TranslatedText element="div">Div text</TranslatedText>
    );
    expect(container.querySelector('div')?.textContent).toBe('Div text');
  });

  it('uses immediate Spanish dictionary translations without calling the API', async () => {
    setMockLanguage('es-ES');
    mockGetSpanishTranslation.mockReturnValue('Hola Mundo');

    render(<TranslatedText>Hello World</TranslatedText>);

    await waitFor(() => expect(screen.getByText('Hola Mundo')).toBeInTheDocument());
    expect(mockTranslateText).not.toHaveBeenCalled();
  });

  it('skips translation for very short strings', async () => {
    setMockLanguage('es-ES');

    render(<TranslatedText>A</TranslatedText>);

    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
    expect(mockTranslateText).not.toHaveBeenCalled();
  });

  it('uses the async translation API when no dictionary translation exists', async () => {
    setMockLanguage('es-ES');
    mockTranslateText.mockResolvedValue('Texto traducido');

    render(<TranslatedText>Hello classroom</TranslatedText>);

    await waitFor(() => expect(screen.getByText('Texto traducido')).toBeInTheDocument());
    expect(mockTranslateText).toHaveBeenCalledWith('Hello classroom');
  });

  it('shows a loader while async translation is pending when requested', async () => {
    setMockLanguage('es-ES');
    let resolveTranslation: ((value: string) => void) | undefined;
    mockTranslateText.mockImplementation(() => new Promise((resolve) => {
      resolveTranslation = resolve;
    }));

    const { container } = render(
      <TranslatedText showLoader>Hello classroom</TranslatedText>
    );

    await waitFor(() => expect(container.querySelector('.opacity-60')).toBeInTheDocument());
    resolveTranslation?.('Hola clase');
    await waitFor(() => expect(screen.getByText('Hola clase')).toBeInTheDocument());
  });

  it('falls back to the fallback prop when translation fails', async () => {
    setMockLanguage('es-ES');
    mockTranslateText.mockRejectedValue(new Error('network down'));

    render(<TranslatedText fallback="Texto de reserva">Hello classroom</TranslatedText>);

    await waitFor(() => expect(screen.getByText('Texto de reserva')).toBeInTheDocument());
  });

  it('renders the fallback when both children and translated text are empty', () => {
    render(<TranslatedText fallback="Fallback only">{''}</TranslatedText>);
    expect(screen.getByText('Fallback only')).toBeInTheDocument();
  });
});
