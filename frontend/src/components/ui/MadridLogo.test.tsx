import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import MadridLogo from './MadridLogo';

type LogoVariant = 'positive' | 'negative';
type LogoSize = 'sm' | 'md' | 'lg';

describe('MadridLogo', () => {
  it('renders without throwing', () => {
    const { container } = render(<MadridLogo />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it.each([['sm'], ['md'], ['lg']])('renders size=%s without error', (size) => {
    const { container } = render(<MadridLogo size={size as LogoSize} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it.each([['positive'], ['negative']])('renders variant=%s without error', (variant) => {
    const { container } = render(<MadridLogo variant={variant as LogoVariant} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<MadridLogo className="custom-logo" />);
    expect(container.firstChild).toHaveClass('custom-logo');
  });

  it('renders 7 stars (4 top + 3 bottom)', () => {
    const { container } = render(<MadridLogo />);
    // lucide Star icons render as SVG elements
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(7);
  });

  it('applies positive background color by default', () => {
    const { container } = render(<MadridLogo />);
    const coloredDiv = container.querySelector('.bg-\\[\\#ff0000\\]');
    expect(coloredDiv).toBeInTheDocument();
  });

  it('applies negative styling when variant=negative', () => {
    const { container } = render(<MadridLogo variant="negative" />);
    const coloredDiv = container.querySelector('.bg-white');
    expect(coloredDiv).toBeInTheDocument();
  });
});
