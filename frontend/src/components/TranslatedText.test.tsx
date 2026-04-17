import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

const mocks = vi.hoisted(() => ({
  language: 'en-US',
  translateText: vi.fn(async (text: string) => text),
  getSpanishTranslation: vi.fn((text: string) => text),
}));

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: mocks.language,
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: mocks.translateText,
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../services/SpanishTranslations', () => ({
  getSpanishTranslation: mocks.getSpanishTranslation,
}));

import TranslatedText from './TranslatedText';

describe('TranslatedText', () => {
  beforeEach(() => {
    mocks.language = 'en-US';
    mocks.translateText.mockReset();
    mocks.translateText.mockImplementation(async (text: string) => text);
    mocks.getSpanishTranslation.mockReset();
    mocks.getSpanishTranslation.mockImplementation((text: string) => text);
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

  it('uses the immediate Spanish dictionary result when available', () => {
    mocks.language = 'es-ES';
    mocks.getSpanishTranslation.mockImplementation((text: string) => text === 'Home' ? 'Inicio' : text);

    render(<TranslatedText>Home</TranslatedText>);

    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(mocks.translateText).not.toHaveBeenCalled();
  });

  it('skips translation for very short strings', async () => {
    mocks.language = 'es-ES';

    render(<TranslatedText>A</TranslatedText>);

    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
    expect(mocks.translateText).not.toHaveBeenCalled();
  });

  it('renders the async translation result when no dictionary entry exists', async () => {
    mocks.language = 'es-ES';
    mocks.translateText.mockResolvedValueOnce('Bonjour');

    render(<TranslatedText>Hello</TranslatedText>);

    await waitFor(() => expect(screen.getByText('Bonjour')).toBeInTheDocument());
    expect(mocks.translateText).toHaveBeenCalledWith('Hello');
  });

  it('falls back to the provided fallback text when translation fails', async () => {
    mocks.language = 'es-ES';
    mocks.translateText.mockRejectedValueOnce(new Error('boom'));

    render(<TranslatedText fallback="Respaldo">Missing</TranslatedText>);

    await waitFor(() => expect(screen.getByText('Respaldo')).toBeInTheDocument());
  });

  it('shows the loader wrapper while an async translation is pending', async () => {
    mocks.language = 'es-ES';
    let resolveTranslation: (value: string) => void = () => undefined;
    const pendingTranslation = new Promise<string>((resolve) => {
      resolveTranslation = resolve;
    });
    mocks.translateText.mockReturnValueOnce(pendingTranslation);

    const { container } = render(
      <TranslatedText showLoader>Hello</TranslatedText>
    );

    await waitFor(() => expect(container.querySelector('.opacity-60')).toBeInTheDocument());

    resolveTranslation('Hola');

    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument());
  });

  it('renders the fallback when the translated text and children are empty', async () => {
    render(<TranslatedText fallback="Fallback text"></TranslatedText>);

    await waitFor(() => expect(screen.getByText('Fallback text')).toBeInTheDocument());
  });
});
