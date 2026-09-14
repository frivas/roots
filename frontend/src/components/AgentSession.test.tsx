import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AgentSession from './AgentSession';

vi.mock('./ElevenLabsWidget', () => ({
  default: () => <div data-testid="voice-widget" />,
}));
vi.mock('./AiAccuracyNotice', () => ({
  default: () => <div data-testid="ai-notice" />,
}));
vi.mock('./TranslatedText', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../contexts/LingoTranslationContext', () => ({
  useLingoTranslation: () => ({ language: 'en-US' }),
}));

describe('AgentSession', () => {
  it('renders the shared responsive session header and widget', () => {
    render(
      <AgentSession
        agentId="agent-test"
        title="Math Tutoring"
        backLabel="Back to Online Learning"
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Math Tutoring' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Online Learning/ })).toBeInTheDocument();
    expect(screen.getByTestId('voice-widget')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('flex-col', 'sm:grid');
  });
});
