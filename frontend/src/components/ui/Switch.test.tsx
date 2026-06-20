import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Switch from './Switch';

describe('Switch', () => {
  it('renders with role switch', () => {
    render(<Switch checked={false} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toBeDefined();
  });

  it('reflects unchecked aria state', () => {
    render(<Switch checked={false} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false');
  });

  it('reflects checked aria state', () => {
    render(<Switch checked={true} onCheckedChange={vi.fn()} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('calls onCheckedChange with toggled value on click', async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('applies checked background class when checked', () => {
    render(<Switch checked={true} onCheckedChange={vi.fn()} />);
    const btn = screen.getByRole('switch');
    expect(btn.className).toContain('bg-primary');
  });

  it('applies visible unchecked background (not bg-input) when unchecked', () => {
    render(<Switch checked={false} onCheckedChange={vi.fn()} />);
    const btn = screen.getByRole('switch');
    // bg-input has poor contrast; the fix must use a visually distinct class
    expect(btn.className).not.toContain('bg-input');
  });

  it('uses id attribute when provided', () => {
    render(<Switch checked={false} onCheckedChange={vi.fn()} id="test-switch" />);
    expect(document.getElementById('test-switch')).not.toBeNull();
  });
});
