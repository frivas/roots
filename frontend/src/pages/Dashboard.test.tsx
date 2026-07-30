import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { APP_ROUTES } from '../config/routes';

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));
vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: () => ({
    isInitialized: true,
    preloadingComplete: true,
  }),
}));
vi.mock('../components/TranslatedText', () => ({
  default: ({ children, element: Element = 'span', ...props }: {
    children: string;
    element?: keyof React.JSX.IntrinsicElements;
  }) => <Element {...props}>{children}</Element>,
}));

import Dashboard from './Dashboard';

describe('Dashboard', () => {
  it('labels synthetic dashboard content as demo data', () => {
    render(<Dashboard />);

    expect(screen.getByRole('note')).toHaveTextContent(/demo data.*examples only/i);
  });

  it('opens recent activity through a keyboard-accessible button and registered route', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /new message from teacher/i }));

    expect(navigate).toHaveBeenCalledWith(APP_ROUTES.communicationsNotifications);
  });
});
