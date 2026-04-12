import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Input from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when label prop provided', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    // The label uses htmlFor="email" (from name), input gets id via spread when id is provided
    const label = screen.getByText('Email');
    expect(label.tagName).toBe('LABEL');
  });

  it('shows error message when error prop provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows helperText when no error', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('does not show helperText when error is also provided', () => {
    render(<Input helperText="Helper text" error="Error message" />);
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('fires onChange callback', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards additional input props like placeholder', () => {
    render(<Input placeholder="Enter text here" />);
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
  });

  it('associates label with input via id prop', () => {
    render(<Input label="Username" id="username" />);
    // When id is explicitly passed, the label htmlFor and input id both match
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'username');
  });

  it('sets label htmlFor from name prop when no id provided', () => {
    render(<Input label="Username" name="username" />);
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'username');
  });
});
