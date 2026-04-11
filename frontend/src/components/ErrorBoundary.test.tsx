import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const Bomb = () => {
  throw new Error('test error');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress expected console.error from React's error boundary
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('catches error and shows error UI', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom fallback when fallback prop provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });

  it('renders Try Again button in default error UI', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('Try Again button resets state to show children again', () => {
    let shouldThrow = true;

    const MaybeThrow = () => {
      if (shouldThrow) throw new Error('oops');
      return <div>Recovered</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Simulate fixing the issue and clicking Try Again
    shouldThrow = false;
    fireEvent.click(screen.getByText('Try Again'));

    rerender(
      <ErrorBoundary>
        <MaybeThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});
