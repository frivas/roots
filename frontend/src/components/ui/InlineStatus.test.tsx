import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../TranslatedText', () => ({
  default: ({ children }: { children: string }) => <>{children}</>,
}));

import InlineStatus from './InlineStatus';

describe('InlineStatus', () => {
  it('announces confirmations politely', () => {
    render(<InlineStatus kind="success" message="Changes saved" />);

    expect(screen.getByRole('status')).toHaveTextContent('Changes saved');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('announces validation failures immediately', () => {
    render(<InlineStatus kind="error" message="Add a title" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Add a title');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
