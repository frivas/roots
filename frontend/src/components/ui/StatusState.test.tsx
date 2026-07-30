import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('../TranslatedText', () => ({
  default: ({ children, element: Element = 'span', ...props }: {
    children: string;
    element?: keyof React.JSX.IntrinsicElements;
  }) => <Element {...props}>{children}</Element>,
}));

import StatusState from './StatusState';

describe('StatusState', () => {
  it('announces loading politely and reports busy state', () => {
    render(<StatusState kind="loading" message="Loading dashboard..." />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('announces errors assertively', () => {
    render(<StatusState kind="error" message="Something went wrong" />);

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
