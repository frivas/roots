import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('../../components/TranslatedText', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import SectionPlaceholder from './SectionPlaceholder';

describe('SectionPlaceholder', () => {
  it('renders supplied translated copy without exposing the raw URL', () => {
    render(
      <SectionPlaceholder
        title="My Data"
        description="This section is not available in the demo yet."
      />,
    );

    expect(screen.getByRole('heading', { name: 'My Data' })).toBeInTheDocument();
    expect(screen.getByText('This section is not available in the demo yet.')).toBeInTheDocument();
    expect(screen.queryByText(/current path/i)).not.toBeInTheDocument();
  });
});
