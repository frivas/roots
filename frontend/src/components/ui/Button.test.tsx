import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Button from './Button';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it.each([['primary'], ['secondary'], ['accent'], ['outline'], ['ghost'], ['link']])(
    'variant=%s renders without error',
    (variant) => {
      render(<Button variant={variant as ButtonVariant}>btn</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    }
  );

  it.each([['sm'], ['md'], ['lg']])('size=%s renders without error', (size) => {
    render(<Button size={size as ButtonSize}>btn</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>btn</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>btn</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<Button isLoading>btn</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>btn</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders leftIcon when provided and not loading', () => {
    render(<Button leftIcon={<span data-testid="left-icon" />}>btn</Button>);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders rightIcon when provided and not loading', () => {
    render(<Button rightIcon={<span data-testid="right-icon" />}>btn</Button>);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('does not render icons when isLoading is true', () => {
    render(
      <Button
        isLoading
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      >
        btn
      </Button>
    );
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">btn</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
