# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-12

### Added
- Full Vitest unit test suite: 300 tests across 38 test files covering frontend components, contexts, hooks, services, and all backend routes (~80% coverage, non-page modules)
- Playwright e2e smoke tests with CI integration
- ElevenLabs agent testing suite for all 6 Roots AI agents
- `@vitest/coverage-v8` for coverage reporting (`npm run test:coverage`)

### Fixed
- Patched Next.js DoS CVE (GHSA-q4gf-8mx6-v5v3) — pinned to 15.5.15
- Patched Vite path traversal CVE (GHSA-4w7w-66w2-5vf9)
- Scoped security audit to production dependencies only
- Reclassified `lingo.dev` as devDependency

### Changed
- Upgraded `lucide-react` from 0.574.0 to 1.7.0
- Upgraded `openai` from 5.23.2 to 6.33.0
- Upgraded `globals` from 15.15.0 to 17.4.0
- Upgraded `dotenv` from 16.6.1 to 17.4.1

## [0.1.0] - Initial release

Initial private release of the Roots bilingual AI ed-tech platform.
