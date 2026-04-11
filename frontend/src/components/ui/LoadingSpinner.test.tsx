import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

type SpinnerSize = 'sm' | 'md' | 'lg';

describe('LoadingSpinner', () => {
  it.each([['sm'], ['md'], ['lg']])('renders size=%s without error', (size) => {
    const { container } = render(<LoadingSpinner size={size as SpinnerSize} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders without text when text omitted', () => {
    render(<LoadingSpinner />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders text when text prop provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="my-spinner" />);
    expect(container.firstChild).toHaveClass('my-spinner');
  });

  it('renders a spinning element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
