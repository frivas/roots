import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';

// Stub Vite env vars before any module loads so LingoTranslationService
// constructor doesn't throw from a missing VITE_GROQ_API_KEY in tests.
vi.stubEnv('VITE_GROQ_API_KEY', 'test-groq-key');

// Increase async query timeout to handle JSDOM cold-start and lazy-loaded components
// under concurrent test execution.
configure({ asyncUtilTimeout: 10000 });
