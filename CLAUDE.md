# Roots - AI-Powered Educational Platform

## Project Overview

Roots is a bilingual (English/Spanish) AI-powered educational platform for parents and students. It provides AI tutoring services (math, language, chess, storytelling), parent wellness chat, progress interpretation, and school management features. The platform uses conversational AI (ElevenLabs) with real-time story illustration generation (OpenAI DALL-E 3).

## Architecture

- **Frontend**: React 19 + TypeScript + Vite, deployed on **Netlify**
- **Backend**: Fastify + Node.js, deployed on **Vercel** (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk (frontend `@clerk/clerk-react`, backend `@clerk/fastify`)
- **AI Services**: OpenAI DALL-E 3 (image generation), ElevenLabs (conversational AI)
- **Translation**: Hybrid system (local Spanish dictionary + Lingo.dev SDK + caching)

## Monorepo Structure

```
roots/
├── frontend/               # React 19 + Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route page components
│   │   │   ├── services/   # AI service session pages
│   │   │   └── placeholders/
│   │   ├── contexts/       # React contexts (Auth, LingoTranslation)
│   │   ├── services/       # Business logic & data services
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── main.tsx        # App entry point (Clerk + Router + i18n providers)
│   ├── vite.config.ts      # Vite config with dev proxy to backend
│   └── package.json
├── backend/                # Fastify API server
│   ├── src/
│   │   ├── routes/         # API route modules (auth, messages, notifications, services, settings, images)
│   │   └── index.ts        # Server entry (Fastify + Clerk + CORS + SSE)
│   ├── api/
│   │   └── serverless.ts   # Vercel serverless adapter
│   └── package.json
├── scripts/                # Build/check scripts (localization checker)
├── package.json            # Root workspace config (npm workspaces)
└── CLAUDE.md               # This file
```

## Development Commands

```bash
# From project root (npm workspaces)
npm run dev              # Start both frontend + backend concurrently
npm run dev:frontend     # Frontend only (Vite dev server, port 5173)
npm run dev:backend      # Backend only (builds then runs, port 3000)
npm run build            # Build both workspaces
npm run build:frontend   # Frontend build (tsc + vite build)
npm run build:backend    # Backend build (tsc)
npm run lint             # Lint both workspaces
npm run check-localization  # Check for untranslated strings
```

## Environment Setup

### Frontend (`frontend/.env`)
```
VITE_CLERK_PUBLISHABLE_KEY=...    # Clerk publishable key
VITE_BACKEND_URL=http://localhost:3000
VITE_GROQ_API_KEY=...             # Required for Lingo.dev translations
```

### Backend (`backend/.env`)
```
PORT=3000
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
SUPABASE_URL=...
SUPABASE_API_KEY=...               # Supabase anon key
OPENAI_API_KEY=...                 # For DALL-E 3 image generation
FRONTEND_URL=http://localhost:5173 # For CORS
```

## Localization (CRITICAL)

Every user-facing string MUST be wrapped for translation. The project uses a hybrid translation system:

1. **Local dictionary first** (`frontend/src/services/SpanishTranslations.ts`) - 900+ Spanish translations
2. **Cache layer** - Previously translated strings are cached
3. **Lingo.dev SDK** - Dynamic/unknown strings translated via API (uses Groq)
4. **Fallback** - English original if all else fails

### Rules
- Wrap ALL user-facing text: `<TranslatedText>Your text here</TranslatedText>`
- Import: `import TranslatedText from '../components/TranslatedText';`
- For dynamic strings: `const { translateText } = useLingoTranslation();`
- Add common phrases to `frontend/src/services/SpanishTranslations.ts`
- Test with language switcher (English <-> Spanish) before committing
- Spanish regional formats: DD/MM/YYYY dates, +34 phone format, EUR currency

## Code Conventions

- **TypeScript strict mode** in both workspaces
- **Tailwind CSS** for styling (v3, utility-first)
- **Path alias**: `@/` maps to `frontend/src/` (configured in tsconfig + vite)
- **ESM throughout**: `"type": "module"` in all package.json files
- **Backend route pattern**: Fastify plugin functions registered with prefixes (`/api/auth`, `/api/messages`, etc.)
- **Auth pattern**: Clerk plugin wraps protected routes; `getAuth(request)` for user identity
- **No `@ts-nocheck`** unless absolutely necessary
- Prefer composition over inheritance
- Lazy load components when appropriate

## Backend API Routes

All protected routes require Clerk authentication:
- `POST /api/auth/*` - Authentication & user management
- `GET/POST /api/messages/*` - Messaging
- `GET/POST /api/notifications/*` - Notifications
- `GET/POST /api/services/*` - AI service management
- `GET/POST /api/settings/*` - User settings
- `POST /api/images/*` - Image generation

Public endpoints:
- `GET /health` - Health check
- `GET /events/story-illustrations` - SSE stream for real-time illustrations
- `POST /webhook/elevenlabs/story-illustration` - ElevenLabs webhook -> DALL-E 3

## Key Integrations

- **Clerk**: Auth provider wrapping the entire app. Frontend uses `ClerkProvider` + `useAuth`/`useUser`. Backend uses `clerkPlugin` + `getAuth(request)`.
- **Supabase**: PostgreSQL database accessed via `@supabase/supabase-js` in backend routes.
- **OpenAI DALL-E 3**: Generates children's book-style illustrations during storytelling sessions. Called from webhook handler + image routes.
- **ElevenLabs**: Conversational AI agent that triggers story illustration generation via webhooks.
- **Lingo.dev**: Translation SDK for dynamic content. Falls back from local dictionary -> cache -> API.

## Deployment

- **Frontend**: Netlify (auto-deploys from git, `frontend/dist` output)
- **Backend**: Vercel serverless (`backend/api/serverless.ts` adapter wraps Fastify)
- **Dev proxy**: Vite proxies `/api` and `/webhook` requests to `localhost:3000`

## Pre-commit Hooks

Three-layer secret scanning is configured:
1. **gitleaks** - Scans for secrets in git history
2. **detect-secrets** - Baseline secret detection
3. **git-secrets** - AWS-specific and custom secret patterns

## Engineering Guardrails

- **No secrets in code**: Use environment variables via `.env` files (see `.env.example` templates)
- **No copyleft dependencies**: GPL-3.0 and AGPL-3.0 licenses are blocked by CI
- **Escape user input**: Always sanitize before rendering or storing
- **Health endpoint**: Backend exposes `GET /health` — do not remove
- **No dead code**: `knip` runs on PRs to detect unused exports/dependencies
- **Pure functions for business logic**: Keep side effects at the edges (route handlers, hooks)

## Testing

### Framework
- **Unit tests**: Vitest (both frontend and backend)
- **Component tests**: React Testing Library (`@testing-library/react`)
- **E2E tests**: Playwright (Chromium only)

### Conventions
- Test files live alongside source: `Component.test.tsx` next to `Component.tsx`
- Use `describe` / `it` blocks with clear descriptions
- Frontend setup file: `frontend/src/test/setup.ts`

### Commands
```bash
npm test                # Run all unit tests (frontend + backend)
npm run test:frontend   # Frontend unit tests only
npm run test:backend    # Backend unit tests only
npm run test:e2e        # Playwright E2E tests
npm run test:coverage   # Unit tests with coverage reports
```

## Git Workflow

### Branch Strategy
- `main` — production, protected, deploy target
- `develop` — integration branch, PRs merge here first
- Feature branches: `feat/issue-123-description`
- Bug fix branches: `fix/issue-456-description`

### Conventional Commits
Use prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`

### Branch Naming
`<type>/issue-<number>-<short-description>` (e.g., `feat/issue-42-add-chess-tutor`)

## CI/CD Pipeline

### On push / PR to develop or main:
1. **CI** (`ci.yml`): Lint -> Typecheck -> Unit Tests -> Build
2. **Security** (`security.yml`): npm audit + license check
3. **Gitleaks** (`gitleaks.yml`): Secret scanning (full history)

### On PRs only:
4. **Knip** (`knip.yml`): Dead code detection
5. **Bundle Size** (`bundle-size.yml`): Reports JS/CSS bundle sizes as PR comment
6. **Claude Review** (`claude-review.yml`): AI code review (requires `ANTHROPIC_API_KEY` secret)

### Scheduled:
- Security audit: Weekly (Monday 9am UTC)
- Gitleaks: Daily (3am UTC)
- Dependabot: Weekly updates with grouped PRs
