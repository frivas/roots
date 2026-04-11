import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: vi.fn(() => ({
    language: 'en-US',
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: vi.fn(async (t: string) => t),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  })),
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock SpanishTranslations to return unchanged text (no local translation)
vi.mock('../services/SpanishTranslations', () => ({
  getSpanishTranslation: vi.fn((text: string) => text),
}));

import TranslatedText from './TranslatedText';

describe('TranslatedText', () => {
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
});
