import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import PaintingSpinner from './PaintingSpinner';

type SpinnerSize = 'sm' | 'md' | 'lg';

describe('PaintingSpinner', () => {
  it('renders without throwing', () => {
    const { container } = render(<PaintingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it.each([['sm'], ['md'], ['lg']])('renders size=%s without error', (size) => {
    const { container } = render(<PaintingSpinner size={size as SpinnerSize} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders color dots (8 dots)', () => {
    const { container } = render(<PaintingSpinner />);
    // The component renders 8 color dots (one per color in the colors array)
    const dots = container.querySelectorAll('.rounded-full.w-3.h-3');
    expect(dots.length).toBe(8);
  });

  it('renders the outer wrapper with p-8 padding', () => {
    const { container } = render(<PaintingSpinner />);
    const wrapper = container.querySelector('.p-8');
    expect(wrapper).toBeInTheDocument();
  });
});
