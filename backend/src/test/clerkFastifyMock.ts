import { vi } from 'vitest';

/**
 * Install a no-op Clerk Fastify plugin mock with a specific authenticated userId.
 * Call at the top of test files (vi.mock is hoisted by Vitest).
 */
export const installClerkFastifyMock = ({ userId = 'user_test_123' }: { userId?: string } = {}) => {
  vi.mock('@clerk/fastify', () => ({
    clerkPlugin: async (_app: unknown) => { /* no-op — tests inject auth via getAuth stub */ },
    getAuth: vi.fn(() => ({ userId })),
  }));
};

/**
 * Install a no-op Clerk Fastify plugin mock for the unauthenticated case.
 */
export const installClerkFastifyMockNoAuth = () => {
  vi.mock('@clerk/fastify', () => ({
    clerkPlugin: async (_app: unknown) => {},
    getAuth: vi.fn(() => ({ userId: null })),
  }));
};
