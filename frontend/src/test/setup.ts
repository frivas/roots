import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Increase async query timeout to handle JSDOM cold-start and lazy-loaded components
// under concurrent test execution.
configure({ asyncUtilTimeout: 10000 });
