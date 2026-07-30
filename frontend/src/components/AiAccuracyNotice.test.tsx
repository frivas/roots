import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('./TranslatedText', () => ({
  default: ({ children }: { children: string }) => <>{children}</>,
}));

import AiAccuracyNotice from './AiAccuracyNotice';

describe('AiAccuracyNotice', () => {
  it('keeps the disclosure visible and available to assistive technology', () => {
    render(<AiAccuracyNotice />);

    expect(screen.getByRole('note', { name: /ai accuracy notice/i })).toBeVisible();
    expect(screen.getByText(/may contain inaccuracies/i)).toBeVisible();
  });
});
