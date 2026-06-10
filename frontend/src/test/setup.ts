import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';
import { configure } from '@testing-library/react';

expect.extend(matchers);

// Increase async query timeout to handle JSDOM cold-start and lazy-loaded components
// under concurrent test execution.
configure({ asyncUtilTimeout: 10000 });
