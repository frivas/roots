import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: () => ({ language: 'en-US' }),
}));
vi.mock('../components/TranslatedText', () => ({
  default: ({ children }: { children: string }) => <>{children}</>,
}));

import StudentProfile from './StudentProfile';

describe('StudentProfile', () => {
  it('exposes profile accordions as native buttons with expanded state', () => {
    render(<StudentProfile />);
    const birthData = screen.getByRole('button', { name: /birth data/i });

    expect(birthData).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Birth Date')).not.toBeInTheDocument();
    fireEvent.click(birthData);

    expect(birthData).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Birth Date')).toBeInTheDocument();
  });

  it('delivers the student photo with explicit lazy dimensions', () => {
    render(<StudentProfile />);
    const image = screen.getByRole('img', { name: /sofía hernández lópez/i });

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('width', '96');
    expect(image).toHaveAttribute('height', '128');
  });
});
