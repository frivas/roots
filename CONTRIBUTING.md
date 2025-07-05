# Contributing to Roots

We love your input! We want to make contributing to Roots as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Request Process

1. Fork the repo and create your branch from `develop`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch for integration
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Critical fixes for production

## Setting Up Development Environment

### Prerequisites

- Node.js 20+
- npm or yarn
- API Keys: OpenAI, ElevenLabs, Lingo.dev/Groq, Clerk

### Installation

1. **Clone your fork**

   ```bash
   git clone https://github.com/frivas/roots.git
   cd roots
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy example files and fill in your API keys
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## Code Style Guidelines

### Localization Requirements (CRITICAL)

Every new feature, component, page, or text addition MUST follow these localization rules:

- ✅ **DO**: Wrap ALL user-facing strings with `<TranslatedText>Your text here</TranslatedText>`
- ❌ **DON'T**: Use raw strings directly in TSX: `<span>Settings</span>`

### Code Standards

- Use TypeScript strictly - no `@ts-nocheck` unless absolutely necessary
- Follow existing component patterns
- Use Tailwind CSS classes consistently
- Prefer composition over inheritance
- Write self-documenting code with clear variable names

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:

```
feat(translation): add Spanish support for dashboard
fix(auth): resolve login redirect issue
docs: update API documentation
```

## Testing Guidelines

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm run test
```

### Localization Testing

```bash
npm run check-localization
```

### Pre-commit Checklist

Before submitting a PR, ensure:

- [ ] No hardcoded English strings in TSX
- [ ] All user-facing text uses TranslatedText component
- [ ] Spanish translations added to SpanishTranslations.ts for common phrases
- [ ] Tested with language switcher (English ↔ Spanish)
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Localization check passes (`npm run check-localization`)

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/frivas/roots/issues/new?template=bug_report.md).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We use GitHub issues to track feature requests. Request a feature by [opening a new issue](https://github.com/frivas/roots/issues/new?template=feature_request.md).

## Security Vulnerabilities

Please review our [Security Policy](SECURITY.md) for reporting security vulnerabilities.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

## Questions?

Don't hesitate to reach out! You can:

- Open an issue for questions about development
- Start a discussion for broader topics
- Contact the maintainers directly

## Recognition

Contributors will be recognized in our README and release notes. We appreciate every contribution, no matter how small!

Thank you for contributing to Roots! 🌱
