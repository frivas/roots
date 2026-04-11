import { vi } from 'vitest';

/**
 * Install a mock for the `openai` package.
 * The mock client returns a deterministic image URL from images.generate.
 */
export const installOpenAIMock = () => {
  vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
      images: {
        generate: vi.fn(async () => ({
          data: [{ url: 'https://img.test/mock.png' }],
        })),
      },
    })),
  }));
};
